from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib import messages
from django.template.loader import render_to_string
from collections import defaultdict
from django.utils.text import slugify
from django.db import models

import os
import time

from .models import (
    Subject, QuestionPaper, PaperAttempt, Question, Answer, Evaluation
)
from .forms import (
    SubjectForm, QuestionPaperForm, SubmitAnswerForm, QuestionForm,
    AnswerUploadForm, EvaluationForm
)

# -------------------------------
# ROLE CHECK
# -------------------------------
def is_teacher(user):
    return user.is_staff or user.groups.filter(name__iexact='Teachers').exists()

# -------------------------------
# SUBJECT MANAGEMENT
# -------------------------------
@user_passes_test(is_teacher)
def add_subject(request):
    next_url = request.GET.get('next') or reverse('questionpapers:paper_create')

    if request.method == 'POST' and 'delete_subject_id' in request.POST:
        subject = get_object_or_404(Subject, id=request.POST.get('delete_subject_id'))
        subject_name = subject.name
        subject.delete()
        messages.success(request, f"Subject '{subject_name}' deleted successfully.")
        return redirect(request.path)

    if request.method == 'POST' and 'update_subject_id' in request.POST:
        subject = get_object_or_404(Subject, id=request.POST.get('update_subject_id'))
        form = SubjectForm(request.POST, instance=subject)
        if form.is_valid():
            updated_subject = form.save()
            messages.success(request, f"Subject '{updated_subject.name}' updated successfully.")
            return redirect(request.path)
        messages.error(request, "Error updating subject. Please check the form.")

    if request.method == 'POST' and 'add_subject' in request.POST:
        form = SubjectForm(request.POST)
        if form.is_valid():
            subject = form.save()
            messages.success(request, f"Subject '{subject.name}' added successfully.")
            return redirect(request.path)
        messages.error(request, "Error adding subject. Please check the form.")
    else:
        form = SubjectForm()

    subjects = Subject.objects.all().order_by('name')
    return render(request, 'questionpapers/add_subject.html', {
        'form': form,
        'next': next_url,
        'subjects': subjects
    })

# -------------------------------
# PAPER LIST / DETAIL
# -------------------------------
@login_required
def paper_list(request):
    if is_teacher(request.user):
        papers = QuestionPaper.objects.select_related('subject').all().order_by('subject__name', 'title')
    else:
        papers = QuestionPaper.objects.select_related('subject').filter(is_published=True).order_by('subject__name', 'title')

    papers_by_subject = defaultdict(list)
    for paper in papers:
        subject_name = paper.subject.name if hasattr(paper.subject, 'name') else str(paper.subject)
        papers_by_subject[subject_name].append(paper)

    return render(request, 'questionpapers/paper_list.html', {'papers_by_subject': dict(papers_by_subject)})

@login_required
def paper_detail(request, pk):
    paper = get_object_or_404(QuestionPaper, pk=pk)
    questions = paper.questions.all().order_by('order')
    if is_teacher(request.user):
        return redirect('questionpapers:upload_questions', paper_id=paper.id)
    return render(request, 'questionpapers/paper_detail.html', {'paper': paper, 'questions': questions})

# -------------------------------
# PAPER CREATE / UPDATE / DELETE
# -------------------------------
@user_passes_test(is_teacher)
def paper_create(request):
    if request.method == 'POST':
        form = QuestionPaperForm(request.POST, request.FILES)
        if form.is_valid():
            paper = form.save(commit=False)
            paper.created_by = request.user
            paper.save()
            messages.success(request, "Question paper created successfully. You can now upload questions.")
            return redirect('questionpapers:upload_questions', paper_id=paper.id)
    else:
        form = QuestionPaperForm()
    return render(request, 'questionpapers/paper_form.html', {'form': form})

@user_passes_test(is_teacher)
def paper_update(request, pk):
    paper = get_object_or_404(QuestionPaper, pk=pk)
    if request.method == 'POST':
        form = QuestionPaperForm(request.POST, request.FILES, instance=paper)
        if form.is_valid():
            form.save()
            messages.success(request, "Question paper updated successfully.")
            return redirect('questionpapers:paper_detail', pk=paper.pk)
    else:
        form = QuestionPaperForm(instance=paper)
    return render(request, 'questionpapers/paper_form.html', {'form': form, 'update_mode': True})

@user_passes_test(is_teacher)
def paper_delete(request, pk):
    paper = get_object_or_404(QuestionPaper, pk=pk)
    if request.method == 'POST':
        paper.delete()
        messages.success(request, "Question paper deleted successfully.")
        return redirect('questionpapers:paper_list')
    return render(request, 'questionpapers/paper_confirm_delete.html', {'paper': paper})

# -------------------------------
# UPLOAD / MANAGE QUESTIONS (with marks)
# -------------------------------
@user_passes_test(is_teacher)
def upload_questions(request, paper_id):
    paper = get_object_or_404(QuestionPaper, id=paper_id)
    questions = paper.questions.all().order_by('order')

    edit_id = request.GET.get('edit')
    delete_id = request.GET.get('delete')

    if delete_id:
        question = get_object_or_404(paper.questions, id=delete_id)
        question.delete()
        messages.success(request, f"Question {question.order} deleted successfully.")
        return redirect('questionpapers:upload_questions', paper_id=paper.id)

    if edit_id:
        question = get_object_or_404(paper.questions, id=edit_id)
        form = QuestionForm(request.POST or None, request.FILES or None, instance=question, paper=paper)
        if request.method == 'POST' and form.is_valid():
            form.save()
            messages.success(request, f"Question {question.order} updated successfully.")
            return redirect('questionpapers:upload_questions', paper_id=paper.id)
        return render(request, 'questionpapers/upload_questions.html', {
            'paper': paper, 'questions': questions, 'form': form,
            'edit_mode': True, 'edit_question': question, 'pdf_only': False
        })

    next_order = (questions.last().order + 1) if questions.exists() else 1

    if request.method == 'POST':
        # Save marks for existing questions
        for q in questions:
            mark = request.POST.get(f'marks_{q.id}')
            if mark not in [None, '']:
                q.marks = mark
                q.save()

        # Add new question
        form = QuestionForm(request.POST, request.FILES, paper=paper)
        if form.is_valid():
            question = form.save(commit=False)
            question.paper = paper
            if not question.order:
                question.order = next_order
            question.save()
            messages.success(request, f"Question {question.order} added successfully.")
            return redirect('questionpapers:upload_questions', paper_id=paper.id)
        else:
            messages.error(request, "Error uploading question. Please check the form.")
    else:
        form = QuestionForm(initial={'order': next_order}, paper=paper)

    return render(request, 'questionpapers/upload_questions.html', {
        'paper': paper, 'questions': questions, 'form': form,
        'edit_mode': False, 'pdf_only': False
    })

# -------------------------------
# STUDENT PAPER WORKFLOW
# -------------------------------
@login_required
def start_paper(request, pk):
    paper = get_object_or_404(QuestionPaper, pk=pk, is_published=True)
    if is_teacher(request.user):
        return redirect('questionpapers:upload_questions', paper_id=paper.id)

    attempt, created = PaperAttempt.objects.get_or_create(
        paper=paper, user=request.user, defaults={'started_at': timezone.now()}
    )
    if not created and attempt.submitted:
        return redirect('questionpapers:paper_result', pk=attempt.pk)
    return redirect('questionpapers:take_paper', paper_id=paper.id, q_order=1)

@login_required
def take_paper(request, paper_id, q_order=1):
    paper = get_object_or_404(QuestionPaper, id=paper_id)
    if is_teacher(request.user):
        return redirect('questionpapers:upload_questions', paper_id=paper.id)

    attempt, _ = PaperAttempt.objects.get_or_create(user=request.user, paper=paper, defaults={'started_at': timezone.now()})
    if attempt.submitted:
        return redirect('questionpapers:paper_result', pk=attempt.pk)

    elapsed = timezone.now() - attempt.started_at
    remaining_seconds = max(0, paper.duration_minutes * 60 - int(elapsed.total_seconds()))

    questions = list(paper.questions.all().order_by('order'))
    if not questions:
        messages.error(request, "No questions available for this paper.")
        return redirect('questionpapers:paper_list')

    q_order = max(1, min(int(q_order), len(questions)))
    q_index = q_order - 1
    question = questions[q_index]

    answer, _ = Answer.objects.get_or_create(user=request.user, question=question)

    if request.method == 'POST' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        selected_option = request.POST.get('selected_option')
        answer_file = request.FILES.get('answer_file')
        changed = False

        if selected_option:
            answer.selected_option = selected_option
            answer.submitted = False
            answer.save()
            changed = True
        if answer_file:
            answer.answer_file = answer_file
            answer.submitted = False
            answer.save()
            changed = True

        html = render_to_string('questionpapers/question_fragment.html', {
            'question': question, 'answer': answer,
            'q_index': q_index, 'q_total': len(questions), 'paper': paper
        }, request=request)

        return JsonResponse({
            'html': html, 'q_index': q_index,
            'q_total': len(questions), 'remaining_seconds': remaining_seconds
        })

    return render(request, 'questionpapers/take_paper.html', {
        'paper': paper, 'question': question, 'answer': answer,
        'q_index': q_index, 'q_total': len(questions),
        'remaining_seconds': remaining_seconds,
    })

# -------------------------------
# AJAX: LOAD / SAVE QUESTION
# -------------------------------
@login_required
def load_question(request, paper_id, q_order):
    paper = get_object_or_404(QuestionPaper, id=paper_id)
    questions = list(paper.questions.all().order_by('order'))
    q_index = max(0, min(int(q_order)-1, len(questions)-1))
    question = questions[q_index]
    attempt, _ = PaperAttempt.objects.get_or_create(user=request.user, paper=paper, defaults={'started_at': timezone.now()})
    answer, _ = Answer.objects.get_or_create(user=request.user, question=question)

    html = render_to_string('questionpapers/question_fragment.html', {
        'paper': paper, 'question': question, 'q_index': q_index,
        'q_total': len(questions), 'answer': answer,
    }, request=request)
    return JsonResponse({'html': html, 'q_order': q_index + 1})

@login_required
def save_answer(request, paper_id, q_order):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)

    paper = get_object_or_404(QuestionPaper, id=paper_id)
    questions = list(paper.questions.all().order_by('order'))
    question = questions[int(q_order)-1]
    answer, _ = Answer.objects.get_or_create(user=request.user, question=question)

    selected_option = request.POST.get('selected_option')
    answer_file = request.FILES.get('answer_file')
    changed = False

    if selected_option is not None:
        answer.selected_option = selected_option
        changed = True

    if answer_file:
        answer.answer_file = answer_file
        changed = True

    if changed:
        answer.submitted = False
        answer.save()
        return JsonResponse({'status': 'saved', 'file_url': answer.answer_file.url})
    else:
        return JsonResponse({'status': 'no_change'})

# -------------------------------
# STUDENT: UPLOAD WRITTEN ANSWER
# -------------------------------
@login_required
@require_POST
def upload_written_answer(request, question_id):
    """
    Handles per-question written answer upload.
    """
    question = get_object_or_404(Question, id=question_id)
    paper_attempt = get_object_or_404(PaperAttempt, user=request.user, paper=question.paper)

    uploaded_file = request.FILES.get('answer_file')
    file_url = None
    if uploaded_file:
        ext = os.path.splitext(uploaded_file.name)[1]
        filename = f"{slugify(request.user.username)}_{int(time.time())}{ext}"
        paper_attempt.answer_file.save(filename, uploaded_file)
        paper_attempt.save()
        file_url = paper_attempt.answer_file.url

    answer, _ = Answer.objects.get_or_create(user=request.user, question=question)
    if uploaded_file:
        answer.answer_file = uploaded_file
        answer.save()

    return JsonResponse({'status': 'saved', 'file_url': file_url})

# -------------------------------
# STUDENT: FINAL SUBMIT (with per-question marks)
# -------------------------------
@login_required
@require_POST
def final_submit(request, paper_id):
    paper = get_object_or_404(QuestionPaper, id=paper_id)
    questions = paper.questions.all()
    answers = Answer.objects.filter(user=request.user, question__in=questions)
    answers.update(submitted=True)

    total_marks = 0
    obtained_marks = 0
    for q in questions:
        mark = getattr(q, 'marks', 0) or 0
        total_marks += mark
        if q.question_type == 'MCQ' and q.correct_option:
            a = answers.filter(question=q).first()
            if a and a.selected_option and a.selected_option.upper() == q.correct_option.upper():
                obtained_marks += mark

    attempt, _ = PaperAttempt.objects.get_or_create(paper=paper, user=request.user)
    attempt.submitted = True
    attempt.finished_at = timezone.now()
    attempt.score = obtained_marks
    attempt.max_score = total_marks
    attempt.save()

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({'status': 'ok', 'redirect_url': reverse('questionpapers:paper_result', args=[attempt.pk])})

    return redirect('questionpapers:paper_result', pk=attempt.pk)

# -------------------------------
# STUDENT: RESULT VIEW
# -------------------------------
@login_required
def paper_result(request, pk):
    attempt = get_object_or_404(PaperAttempt, pk=pk, user=request.user)
    evaluation = getattr(attempt, 'evaluation', None)
    return render(request, 'questionpapers/result.html', {'attempt': attempt, 'evaluation': evaluation})

# -------------------------------
# 🧑‍🏫 TEACHER: EVALUATION SYSTEM
# -------------------------------
@user_passes_test(is_teacher)
def teacher_paper_list(request):
    papers = QuestionPaper.objects.all().order_by('subject__name', 'year')
    return render(request, 'questionpapers/teacher_paper_list.html', {'papers': papers})


@user_passes_test(is_teacher)
def teacher_attempts(request, paper_id):
    paper = get_object_or_404(QuestionPaper, id=paper_id)
    attempts = paper.attempts.select_related('user', 'evaluation').all()
    return render(request, 'questionpapers/teacher_attempts.html', {
        'paper': paper,
        'attempts': attempts
    })


@user_passes_test(is_teacher)
def evaluate_attempt(request, attempt_id):
    attempt = get_object_or_404(PaperAttempt, id=attempt_id)
    question_answers = {
        q: q.answers.filter(user=attempt.user).first()
        for q in attempt.paper.questions.all()
    }

    # Try fetching existing evaluation
    try:
        evaluation = attempt.evaluation
    except Evaluation.DoesNotExist:
        evaluation = None

    if request.method == 'POST':
        if not evaluation:
            evaluation = Evaluation(attempt=attempt, teacher=request.user)
        form = EvaluationForm(request.POST, instance=evaluation)

        if form.is_valid():
            evaluation = form.save(commit=False)
            evaluation.teacher = request.user
            evaluation.attempt = attempt
            evaluation.save()

            # ✅ Update PaperAttempt with evaluation marks and total possible score
            total_marks = attempt.paper.questions.aggregate(total=models.Sum('marks'))['total'] or 0
            attempt.score = float(evaluation.marks)
            attempt.max_score = float(total_marks)
            attempt.submitted = True
            attempt.save()

            messages.success(request, f"Evaluation saved for {attempt.user.username}.")
            return redirect('questionpapers:teacher_attempts', paper_id=attempt.paper.id)
    else:
        form = EvaluationForm(instance=evaluation)

    return render(request, 'questionpapers/evaluate_attempt.html', {
        'attempt': attempt,
        'form': form,
        'question_answers': question_answers
    })
