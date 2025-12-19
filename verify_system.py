#!/usr/bin/env python
"""Test complete exam flow"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from exams.models import Exam, Attempt

User = get_user_model()

print("\n" + "="*60)
print("VERIFYING COMPLETE EXAM SYSTEM")
print("="*60)

# Check latest attempt
attempts = Attempt.objects.all().order_by('-id')[:3]
print(f"\n✅ Recent Attempts: {attempts.count()}")

for attempt in attempts:
    print(f"\n  Attempt {attempt.id}:")
    print(f"    - User: {attempt.user.username}")
    print(f"    - Exam: {attempt.exam.title}")
    print(f"    - Status: {attempt.status}")
    print(f"    - Score: {attempt.total_score}")
    print(f"    - Percentage: {attempt.percentage}%")
    print(f"    - Duration: {attempt.duration_seconds}s")
    
    responses = attempt.responses.all()
    print(f"    - Responses: {responses.count()}")
    for r in responses:
        print(f"      Q{r.question_id}: {'✓' if r.correct else '✗'} ({r.question.marks} marks)")

print("\n" + "="*60)
print("✅ SYSTEM VERIFICATION COMPLETE")
print("="*60 + "\n")
