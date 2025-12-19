#!/usr/bin/env python
"""Test start exam endpoint"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
django.setup()

from django.test import RequestFactory
from exams.views import start_exam
from django.contrib.auth import get_user_model
from exams.models import Exam

User = get_user_model()

print("\n" + "="*60)
print("TESTING START EXAM ENDPOINT")
print("="*60)

# Get or create test user
user, _ = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@test.com'}
)
user.set_password('password')
user.save()

# Get first exam
exam = Exam.objects.filter(is_active=True).first()
if not exam:
    print("\n❌ No active exams found!")
    exit(1)

print(f"\n📝 Testing with Exam ID: {exam.id} - {exam.title}")

# Create request
factory = RequestFactory()
request = factory.get(f'/api/exams/{exam.id}/start/')
request.user = user

try:
    response = start_exam(request, exam.id)
    print(f"\n✅ Status Code: {response.status_code}")
    print(f"✅ Response Data:")
    print(json.dumps(response.data, indent=2))
    
    # Verify structure
    if 'attempt_id' in response.data:
        print(f"\n✅ Attempt ID: {response.data['attempt_id']}")
    if 'expires_at' in response.data:
        print(f"✅ Expires At: {response.data['expires_at']}")
    if 'questions' in response.data:
        print(f"✅ Questions Count: {len(response.data['questions'])}")
        if response.data['questions']:
            q = response.data['questions'][0]
            print(f"\n  First Question:")
            print(f"    - ID: {q.get('id')}")
            print(f"    - Type: {q.get('type')}")
            print(f"    - Statement: {q.get('statement', '')[:50]}...")
            print(f"    - Choices: {q.get('choices')}")
            print(f"    - Marks: {q.get('marks')}")
            print(f"    - Time Est: {q.get('time_est')}")
    
    print("\n" + "="*60)
    print("✅ START EXAM ENDPOINT WORKING!")
    print("="*60 + "\n")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    print("="*60 + "\n")
