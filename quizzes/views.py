# IB_Django/quizzes/views.py
import csv, io, requests
import pandas as pd
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import PermissionDenied
from .models import Quiz, Question, QuizAttempt, AttemptAnswer
from .forms import QuizForm, QuestionForm
from django.views.decorators.http import require_http_methods
from django.utils.text import slugify

# -------------------------------
# Quiz List View
# -------------------------------
def quiz_list(request):
    quizzes = Quiz.objects.filter(is_active=True).order_by('-created_at')
    return render(request, 'quizzes/quiz_list.html', {'quizzes': quizzes})

# -------------------------------
# Start Quiz
# -------------------------------
@login_required
def start_quiz(request, quiz_id):
    quiz = get_object_or_404(Quiz, pk=quiz_id, is_active=True)
    attempt = QuizAttempt.objects.create(
        user=request.user,
        quiz=quiz,
        max_score=quiz.question_count()
    )
    return redirect('quizzes:take_question', attempt_id=attempt.id, question_index=0)

# -------------------------------
# Take Question
# -------------------------------
@login_required
def take_question(request, attempt_id, question_index):
    attempt = get_object_or_404(QuizAttempt, pk=attempt_id, user=request.user)
    questions = list(attempt.quiz.questions.filter(is_active=True))

    if question_index < 0 or question_index >= len(questions):
        return redirect('quizzes:quiz_result', attempt_id=attempt.id)

    question = questions[question_index]

    if request.method == 'POST':
        selected = request.POST.get('answer')
        with transaction.atomic():
            ans, _ = AttemptAnswer.objects.get_or_create(attempt=attempt, question=question)
            ans.selected_option = selected  # Save user’s answer correctly
            ans.is_correct = (selected == question.correct_answer)
            ans.save()

        next_index = question_index + 1
        if next_index >= len(questions):
            # Quiz finished: calculate score
            correct_count = attempt.answers.filter(is_correct=True).count()
            attempt.score = correct_count
            attempt.finished_at = timezone.now()
            attempt.save()
            return redirect('quizzes:quiz_result', attempt_id=attempt.id)
        else:
            return redirect('quizzes:take_question', attempt_id=attempt.id, question_index=next_index)

    return render(request, 'quizzes/take_question.html', {
        'question': question,
        'question_index': question_index,
        'total': len(questions),
        'attempt': attempt,
    })


# -------------------------------
# Quiz Result
# -------------------------------
@login_required
def quiz_result(request, attempt_id):
    attempt = get_object_or_404(QuizAttempt, pk=attempt_id, user=request.user)
    answers = attempt.answers.select_related('question').all()  # Fetch all answers

    return render(request, 'quizzes/quiz_result.html', {
        'attempt': attempt,
        'answers': answers
    })

# -------------------------------
# Upload Excel / CSV (Staff Only)
# -------------------------------
@login_required
@require_http_methods(["GET", "POST"])
def upload_quiz_excel(request):
    if not request.user.is_staff:
        raise PermissionDenied

    if request.method == 'POST' and request.FILES.get('excel'):
        file = request.FILES['excel']
        try:
            # CSV support
            if str(file.name).endswith('.csv'):
                decoded = file.read().decode('utf-8')
                reader = csv.DictReader(io.StringIO(decoded))
                rows = list(reader)
            else:  # Excel support
                df = pd.read_excel(file)
                rows = df.to_dict(orient='records')
        except Exception as e:
            messages.error(request, f'Failed to read file: {e}')
            return redirect('quizzes:upload_quiz_excel')

        created_questions = 0
        quiz_cache = {}

        for row in rows:
            try:
                title = str(row.get('quiz_title') or 'Untitled Quiz').strip()
                subject = str(row.get('subject') or 'General').strip()
                difficulty = str(row.get('difficulty') or 'Medium').strip()

                # Unique cache key for quizzes
                cache_key = f"{title}_{subject}_{difficulty}"
                if cache_key not in quiz_cache:
                    quiz, _ = Quiz.objects.get_or_create(
                        title=title,
                        subject=subject,
                        difficulty=difficulty,
                        defaults={'slug': slugify(title)}
                    )
                    quiz_cache[cache_key] = quiz
                else:
                    quiz = quiz_cache[cache_key]

                # Handle image field
                img_value = row.get('image', None)
                if not isinstance(img_value, str) or img_value.strip() == '':
                    img_value = None

                # Create question safely
                Question.objects.create(
                    quiz=quiz,
                    text=str(row.get('text') or '').strip(),
                    option_a=str(row.get('option_a') or '').strip(),
                    option_b=str(row.get('option_b') or '').strip(),
                    option_c=str(row.get('option_c') or '').strip(),
                    option_d=str(row.get('option_d') or '').strip(),
                    correct_answer=str(row.get('correct_option') or 'A').strip().upper()[0],
                    explanation=str(row.get('explanation') or '').strip(),
                    image=img_value
                )
                created_questions += 1

            except Exception as e:
                print(f"Skipping row due to error: {e}")
                continue

        messages.success(request, f'Successfully uploaded {created_questions} questions.')
        return redirect('quizzes:quiz_list')

    return render(request, 'quizzes/upload_excel.html')



# -------------------------------
# Staff/Management Decorator
# -------------------------------
def _staff_required(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        raise PermissionDenied

# -------------------------------
# Manage Quiz (Staff)
# -------------------------------
@login_required
def manage_quiz(request, quiz_id):
    _staff_required(request)
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    questions = quiz.questions.filter(is_active=True).order_by('id')
    return render(request, 'quizzes/manage_quiz.html', {'quiz': quiz, 'questions': questions})

@login_required
def edit_quiz(request, quiz_id):
    _staff_required(request)
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    if request.method == 'POST':
        form = QuizForm(request.POST, instance=quiz)
        if form.is_valid():
            form.save()
            messages.success(request, 'Quiz updated.')
            return redirect('quizzes:manage_quiz', quiz_id=quiz.id)
    else:
        form = QuizForm(instance=quiz)
    return render(request, 'quizzes/update_quiz.html', {'form': form, 'quiz': quiz})

# -------------------------------
# Delete Quiz (Safe)
# -------------------------------
@login_required
def delete_quiz(request, quiz_id):
    _staff_required(request)
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    if request.method == 'POST':
        # Soft-delete quiz and its questions
        quiz.soft_delete()
        for q in quiz.questions.all():
            q.soft_delete()
        messages.success(request, 'Quiz deleted successfully. User scores are preserved.')
        return redirect('quizzes:quiz_list')
    return render(request, 'quizzes/confirm_delete.html', {'object': quiz, 'type_name': 'Quiz', 'cancel_url': '/quizzes/'})

# -------------------------------
# Question CRUD (Staff)
# -------------------------------
@login_required
def add_question(request, quiz_id):
    _staff_required(request)
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    if request.method == 'POST':
        form = QuestionForm(request.POST)
        if form.is_valid():
            q = form.save(commit=False)
            q.quiz = quiz
            q.save()
            messages.success(request, 'Question added.')
            return redirect('quizzes:manage_quiz', quiz_id=quiz.id)
    else:
        form = QuestionForm()
    return render(request, 'quizzes/update_question.html', {'form': form, 'quiz': quiz, 'create': True})

@login_required
def edit_question(request, question_id):
    _staff_required(request)
    question = get_object_or_404(Question, pk=question_id)
    if request.method == 'POST':
        form = QuestionForm(request.POST, instance=question)
        if form.is_valid():
            form.save()
            messages.success(request, 'Question updated.')
            return redirect('quizzes:manage_quiz', quiz_id=question.quiz.id)
    else:
        form = QuestionForm(instance=question)
    return render(request, 'quizzes/update_question.html', {'form': form, 'quiz': question.quiz, 'create': False})

@login_required
def delete_question(request, question_id):
    _staff_required(request)
    question = get_object_or_404(Question, pk=question_id)
    quiz = question.quiz
    if request.method == 'POST':
        # Soft-delete question instead of deleting
        question.soft_delete()
        messages.success(request, 'Question deleted successfully. User scores are preserved.')
        return redirect('quizzes:manage_quiz', quiz_id=quiz.id)
    return render(request, 'quizzes/confirm_delete.html', {'object': question, 'type_name': 'Question', 'cancel_url': f'/quizzes/manage/{quiz.id}/'})
