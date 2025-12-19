#!/usr/bin/env python
"""Properly format all questions with correct choices"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
django.setup()

from exams.models import Question, ExamQuestion, Exam

print("\n" + "="*60)
print("REFORMATTING ALL QUESTIONS")
print("="*60)

# Delete existing exam questions first, then questions
ExamQuestion.objects.all().delete()
Question.objects.all().delete()

from exams.models import Topic

topic = Topic.objects.first()
if not topic:
    topic = Topic.objects.create(name='Physics', description='IB Physics')

# Create sample MCQ questions
mcq1 = Question.objects.create(
    topic=topic,
    type='MCQ',
    statement='What is the SI unit of force?',
    choices={
        'A': 'Newton (N)',
        'B': 'Joule (J)',
        'C': 'Watt (W)',
        'D': 'Pascal (Pa)'
    },
    correct_answers=['A'],
    marks=5.0,
    estimated_time=60,
    is_active=True
)

mcq2 = Question.objects.create(
    topic=topic,
    type='MCQ',
    statement='Which law states that F = ma?',
    choices={
        'A': 'Newton\'s First Law',
        'B': 'Newton\'s Second Law',
        'C': 'Newton\'s Third Law',
        'D': 'Law of Gravitation'
    },
    correct_answers=['B'],
    marks=5.0,
    estimated_time=60,
    is_active=True
)

mcq3 = Question.objects.create(
    topic=topic,
    type='MCQ',
    statement='What is the speed of light in vacuum?',
    choices={
        'A': '3 × 10^6 m/s',
        'B': '3 × 10^8 m/s',
        'C': '3 × 10^10 m/s',
        'D': '3 × 10^12 m/s'
    },
    correct_answers=['B'],
    marks=5.0,
    estimated_time=60,
    is_active=True
)

mcq4 = Question.objects.create(
    topic=topic,
    type='MCQ',
    statement='Which of the following is a scalar quantity?',
    choices={
        'A': 'Velocity',
        'B': 'Force',
        'C': 'Energy',
        'D': 'Acceleration'
    },
    correct_answers=['C'],
    marks=5.0,
    estimated_time=60,
    is_active=True
)

mcq5 = Question.objects.create(
    topic=topic,
    type='MCQ',
    statement='What is the unit of electric current?',
    choices={
        'A': 'Volt',
        'B': 'Ampere',
        'C': 'Ohm',
        'D': 'Coulomb'
    },
    correct_answers=['B'],
    marks=5.0,
    estimated_time=60,
    is_active=True
)

print(f"✅ Created 5 MCQ questions")

# Attach questions to exams
for exam in Exam.objects.filter(is_active=True):
    ExamQuestion.objects.filter(exam=exam).delete()
    questions = [mcq1, mcq2, mcq3, mcq4, mcq5]
    for i, q in enumerate(questions):
        ExamQuestion.objects.create(
            exam=exam,
            question=q,
            order=i
        )
    print(f"✅ Attached 5 questions to exam: {exam.title}")

print("\n" + "="*60)
print("✅ ALL QUESTIONS CREATED AND ATTACHED!")
print("="*60 + "\n")
