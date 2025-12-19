#!/usr/bin/env python
"""Check exam data in database"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
django.setup()

from exams.models import Exam, ExamQuestion, Question, Topic

print("\n" + "="*60)
print("DATABASE CHECK")
print("="*60)

# Check exams
exams = Exam.objects.filter(is_active=True)
print(f"\n✅ Active Exams: {exams.count()}")

for exam in exams:
    eq_count = ExamQuestion.objects.filter(exam=exam).count()
    print(f"\n  📝 Exam {exam.id}: {exam.title}")
    print(f"     - Level: {getattr(exam, 'level', 'N/A')}")
    print(f"     - Duration: {exam.duration_seconds}s")
    print(f"     - Questions attached: {eq_count}")
    
    if eq_count == 0:
        # Check if topic has questions
        topic_qs = Question.objects.filter(topic=exam.topic, is_active=True).count()
        print(f"     - Questions in topic '{exam.topic}': {topic_qs}")

print("\n" + "="*60)
print(f"Total Questions in DB: {Question.objects.filter(is_active=True).count()}")
print(f"Total Topics in DB: {Topic.objects.count()}")
print("="*60 + "\n")
