from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from questionpapers.models import QuestionPaper, PaperAttempt, Evaluation
from quizzes.models import QuizAttempt
from django.db.models import Avg, Count, Q

@login_required
def dashboard(request):
    user = request.user
    is_teacher = user.groups.filter(name='Teachers').exists()

    if is_teacher:
        # ------------------ TEACHER DASHBOARD ------------------
        papers = QuestionPaper.objects.filter(created_by=user)

        total_papers = papers.count()
        total_attempts = PaperAttempt.objects.filter(paper__in=papers).count()

        pending_evals = Evaluation.objects.filter(
            evaluated_at__isnull=True,
            attempt__paper__in=papers
        ).count()

        completed_evals = Evaluation.objects.filter(
            evaluated_at__isnull=False,
            attempt__paper__in=papers
        ).count()

        avg_class_score = (
            PaperAttempt.objects.filter(paper__in=papers, score__isnull=False)
            .aggregate(Avg('score'))['score__avg'] or 0
        )

        paper_evaluation_data = []
        for paper in papers:
            pending = Evaluation.objects.filter(
                evaluated_at__isnull=True,
                attempt__paper=paper
            ).count()

            completed = Evaluation.objects.filter(
                evaluated_at__isnull=False,
                attempt__paper=paper
            ).count()

            avg_score = (
                PaperAttempt.objects.filter(paper=paper, score__isnull=False)
                .aggregate(Avg('score'))['score__avg'] or 0
            )

            attempts = PaperAttempt.objects.filter(paper=paper).count()
            total_students = PaperAttempt.objects.filter(paper=paper).values('user').distinct().count()
            completion_pct = round(((attempts / total_students) * 100), 1) if total_students else 0

            paper_evaluation_data.append({
                'paper': paper,
                'pending': pending,
                'completed': completed,
                'avg_score': round(avg_score, 1),
                'attempts': attempts,
                'total_students': total_students,
                'completion_pct': completion_pct,
            })

        context = {
            'is_teacher': True,
            'papers': papers,
            'paper_evaluation_data': paper_evaluation_data,
            'total_papers': total_papers,
            'total_attempts': total_attempts,
            'pending_evals': pending_evals,
            'completed_evals': completed_evals,
            'avg_class_score': round(avg_class_score, 1),
        }

    else:
        # ------------------ STUDENT DASHBOARD ------------------
        attempts = PaperAttempt.objects.filter(user=user)
        total_attempts = attempts.count()
        avg_score = attempts.aggregate(Avg('score'))['score__avg'] or 0

        # Wrap pending papers with total_students for template
        pending_papers_qs = QuestionPaper.objects.exclude(id__in=attempts.values('paper_id'))
        pending_papers = []
        for paper in pending_papers_qs:
            total_students = PaperAttempt.objects.filter(paper=paper).values('user').distinct().count()
            pending_papers.append({
                'paper': paper,
                'total_students': total_students
            })

        quizzes = QuizAttempt.objects.filter(user=user).order_by('-finished_at')[:5]

        context = {
            'is_teacher': False,
            'attempts': attempts,
            'pending_papers': pending_papers,
            'total_attempts': total_attempts,
            'avg_score': round(avg_score, 2),
            'quizzes': quizzes,
        }

    return render(request, 'dashboard/dashboard.html', context)
