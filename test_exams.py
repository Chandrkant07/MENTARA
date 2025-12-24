#!/usr/bin/env python
"""Test script to verify exam data"""
import os
import sys
import django


def _running_under_pytest() -> bool:
    return (
        'PYTEST_CURRENT_TEST' in os.environ
        or any(m == 'pytest' or m.startswith('pytest.') for m in sys.modules)
    )


if _running_under_pytest():
    import pytest  # type: ignore

    pytest.skip(
        'Standalone data audit script (reads DB directly). Run directly, not via pytest.',
        allow_module_level=True,
    )

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
django.setup()

from exams.models import Exam, ExamQuestion, Question
from exams.serializers import ExamSerializer
import json

print("=" * 60)
print("DATABASE EXAM AUDIT")
print("=" * 60)

exams = Exam.objects.filter(is_active=True)
print(f"\nTotal Active Exams: {exams.count()}")

for exam in exams:
    print(f"\n{'=' * 60}")
    print(f"EXAM ID: {exam.id}")
    print(f"Title: {exam.title}")
    print(f"Visibility: {exam.visibility}")
    print(f"Active: {exam.is_active}")
    print(f"Duration: {exam.duration_seconds}s ({exam.duration_seconds // 60}min)")
    print(f"Total Marks: {exam.total_marks}")
    print(f"Topic: {exam.topic}")
    
    eq_count = exam.exam_questions.count()
    print(f"ExamQuestions (junction): {eq_count}")
    
    if eq_count > 0:
        print("\nLinked Questions:")
        for i, eq in enumerate(exam.exam_questions.all()[:3], 1):
            q = eq.question
            print(f"  {i}. Q{q.id}: {q.statement[:60]}...")
    else:
        # Check topic questions
        topic_q = Question.objects.filter(topic=exam.topic, is_active=True).count()
        print(f"Topic '{exam.topic}' has {topic_q} questions")

print(f"\n{'=' * 60}")
print("SERIALIZER OUTPUT TEST")
print("=" * 60)

serializer = ExamSerializer(exams, many=True)
print(json.dumps(serializer.data, indent=2))
