from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Q
from django.db.models import Max
from exams.models import Topic, Question, Exam, Attempt, ExamQuestion
from accounts.models import Badge, UserBadge

User = get_user_model()

def is_admin(user):
    """Check if user has admin role or is superuser/staff"""
    return user and user.is_authenticated and (user.role == 'ADMIN' or user.is_superuser or user.is_staff)


def _can_manage_exams(user):
    return bool(is_admin(user) or (user and user.is_authenticated and getattr(user, 'role', None) == 'TEACHER'))


def _renumber_exam_questions(exam_id):
    eqs = list(
        ExamQuestion.objects.filter(exam_id=exam_id).order_by('order', 'id')
    )
    changed = []
    for idx, eq in enumerate(eqs, start=1):
        if eq.order != idx:
            eq.order = idx
            changed.append(eq)
    if changed:
        ExamQuestion.objects.bulk_update(changed, ['order'])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_overview(request):
    """Get overview statistics for admin dashboard"""
    if not is_admin(request.user):
        return Response({'detail': 'Admin access required'}, status=403)
    
    total_users = User.objects.count()
    total_students = User.objects.filter(role='STUDENT').count()
    total_teachers = User.objects.filter(role='TEACHER').count()
    total_topics = Topic.objects.filter(is_active=True).count()
    total_questions = Question.objects.count()
    total_exams = Exam.objects.count()
    
    # Attempt.status values in this codebase: inprogress/submitted/timedout
    active_attempts = Attempt.objects.filter(status='inprogress').count()
    completed_attempts = Attempt.objects.filter(status__in=['submitted', 'timedout']).count()
    
    # Calculate average score
    avg_score = Attempt.objects.filter(
        status__in=['submitted', 'timedout'],
        percentage__isnull=False
    ).aggregate(Avg('percentage'))['percentage__avg'] or 0
    
    return Response({
        'totalUsers': total_users,
        'totalStudents': total_students,
        'totalTeachers': total_teachers,
        'totalTopics': total_topics,
        'totalQuestions': total_questions,
        'totalExams': total_exams,
        'activeAttempts': active_attempts,
        'completedAttempts': completed_attempts,
        'avgScore': round(avg_score, 2),
        'recentActivity': []  # Can be populated with recent user actions
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """Get all users for admin user management"""
    if not is_admin(request.user):
        return Response({'detail': 'Admin access required'}, status=403)
    
    users = User.objects.all().values(
        'id', 'username', 'email', 'first_name', 'last_name', 
        'role', 'is_active', 'date_joined', 'total_points',
        'current_streak', 'is_premium'
    ).order_by('-date_joined')
    
    return Response(list(users))

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    """Delete a user (admin only)"""
    if not is_admin(request.user):
        return Response({'detail': 'Admin access required'}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
        if user.role == 'ADMIN' and user.id == request.user.id:
            return Response({'detail': 'Cannot delete yourself'}, status=400)
        user.delete()
        return Response({'detail': 'User deleted successfully'})
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    """Get analytics data for admin"""
    if not is_admin(request.user):
        return Response({'detail': 'Admin access required'}, status=403)
    
    # Active users (logged in last 7 days)
    from datetime import timedelta
    from django.utils import timezone
    
    seven_days_ago = timezone.now() - timedelta(days=7)
    active_users = User.objects.filter(last_login__gte=seven_days_ago).count()
    
    # Completion rate
    total_attempts = Attempt.objects.count()
    completed = Attempt.objects.filter(status__in=['submitted', 'timedout']).count()
    completion_rate = (completed / total_attempts * 100) if total_attempts > 0 else 0
    
    # Average score
    avg_score = Attempt.objects.filter(
        status__in=['submitted', 'timedout'],
        percentage__isnull=False
    ).aggregate(Avg('percentage'))['percentage__avg'] or 0
    
    # Top performing topics - get topics with most attempts and highest avg scores
    from django.db.models import Count, Avg as DjangoAvg
    top_topics_data = Topic.objects.filter(is_active=True).annotate(
        attempt_count=Count('exams__attempts', filter=Q(exams__attempts__status__in=['submitted', 'timedout'])),
        avg_score=DjangoAvg('exams__attempts__percentage', filter=Q(exams__attempts__status__in=['submitted', 'timedout']))
    ).filter(attempt_count__gt=0).order_by('-attempt_count', '-avg_score')[:10]
    
    top_topics = []
    for topic in top_topics_data:
        top_topics.append({
            'id': topic.id,
            'name': topic.name,
            'attempts': topic.attempt_count or 0,
            'avg_score': round(topic.avg_score or 0, 2)
        })
    
    return Response({
        'activeUsers': active_users,
        'completionRate': round(completion_rate, 2),
        'avgScore': round(avg_score, 2),
        'totalAttempts': total_attempts,
        'topTopics': top_topics
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_questions_to_exam(request, exam_id):
    """Add questions to an exam"""
    if not _can_manage_exams(request.user):
        return Response({'detail': 'Admin or Teacher access required'}, status=403)
    
    try:
        exam = Exam.objects.get(id=exam_id)
        question_ids = request.data.get('question_ids', [])

        if not isinstance(question_ids, list):
            return Response({'detail': 'question_ids must be a list'}, status=400)

        current_max = (
            ExamQuestion.objects.filter(exam=exam).aggregate(Max('order')).get('order__max')
            or 0
        )

        created_count = 0
        for idx, q_id in enumerate(question_ids, start=1):
            _, created = ExamQuestion.objects.get_or_create(
                exam=exam,
                question_id=q_id,
                defaults={'order': current_max + idx}
            )
            if created:
                created_count += 1

        _renumber_exam_questions(exam.id)

        return Response({'detail': f'Added {created_count} question(s) to exam'})
    except Exam.DoesNotExist:
        return Response({'detail': 'Exam not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exam_questions_list(request, exam_id):
    """List questions currently attached to an exam (ordered)."""
    if not _can_manage_exams(request.user):
        return Response({'detail': 'Admin or Teacher access required'}, status=403)
    try:
        exam = Exam.objects.get(id=exam_id)
    except Exam.DoesNotExist:
        return Response({'detail': 'Exam not found'}, status=404)

    eqs = (
        ExamQuestion.objects.filter(exam=exam)
        .select_related('question')
        .order_by('order', 'id')
    )
    items = []
    for eq in eqs:
        q = eq.question
        items.append(
            {
                'exam_question_id': eq.id,
                'question_id': q.id,
                'order': eq.order,
                'type': q.type,
                'statement': q.statement,
                'marks': q.marks,
                'topic_id': q.topic_id,
                'is_active': q.is_active,
            }
        )

    return Response({'exam_id': exam.id, 'questions': items})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def exam_question_remove(request, exam_id, question_id):
    """Remove a question from an exam (does not delete the question)."""
    if not _can_manage_exams(request.user):
        return Response({'detail': 'Admin or Teacher access required'}, status=403)
    try:
        Exam.objects.get(id=exam_id)
    except Exam.DoesNotExist:
        return Response({'detail': 'Exam not found'}, status=404)

    deleted, _ = ExamQuestion.objects.filter(exam_id=exam_id, question_id=question_id).delete()
    if not deleted:
        return Response({'detail': 'Question is not attached to this exam'}, status=404)

    _renumber_exam_questions(exam_id)
    return Response({'detail': 'Removed question from exam'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exam_questions_reorder(request, exam_id):
    """Reorder exam questions. Accepts ordered_question_ids (preferred) or question_ids."""
    if not _can_manage_exams(request.user):
        return Response({'detail': 'Admin or Teacher access required'}, status=403)
    try:
        Exam.objects.get(id=exam_id)
    except Exam.DoesNotExist:
        return Response({'detail': 'Exam not found'}, status=404)

    ordered = request.data.get('ordered_question_ids', None)
    if ordered is None:
        ordered = request.data.get('question_ids', [])

    if not isinstance(ordered, list):
        return Response({'detail': 'ordered_question_ids must be a list'}, status=400)

    ordered_ids = [int(x) for x in ordered if str(x).strip().isdigit()]
    if not ordered_ids:
        return Response({'detail': 'No question ids provided'}, status=400)

    eqs = list(
        ExamQuestion.objects.filter(exam_id=exam_id).order_by('order', 'id')
    )
    eq_by_qid = {int(eq.question_id): eq for eq in eqs}

    missing = [qid for qid in ordered_ids if qid not in eq_by_qid]
    if missing:
        return Response({'detail': 'Some questions are not attached to this exam', 'missing': missing}, status=400)

    # Set explicit order for provided ids.
    updates = []
    next_order = 1
    seen = set()
    for qid in ordered_ids:
        eq = eq_by_qid[qid]
        eq.order = next_order
        updates.append(eq)
        next_order += 1
        seen.add(qid)

    # Append any remaining exam questions not included in request.
    for eq in eqs:
        qid = int(eq.question_id)
        if qid in seen:
            continue
        eq.order = next_order
        updates.append(eq)
        next_order += 1

    ExamQuestion.objects.bulk_update(updates, ['order'])
    _renumber_exam_questions(exam_id)
    return Response({'detail': 'Reordered questions', 'count': len(updates)})
