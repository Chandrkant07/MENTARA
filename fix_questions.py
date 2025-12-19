#!/usr/bin/env python
"""Add sample choices to questions"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
django.setup()

from exams.models import Question

print("\n" + "="*60)
print("FIXING QUESTION CHOICES")
print("="*60)

questions = Question.objects.all()

for q in questions:
    print(f"\nQuestion {q.id}: {q.statement[:50]}...")
    print(f"  Type: {q.type}")
    print(f"  Current choices: {q.choices}")
    
    if q.type == 'MCQ' and not q.choices:
        q.choices = {
            'A': 'Option A',
            'B': 'Option B', 
            'C': 'Option C',
            'D': 'Option D'
        }
        q.correct_answers = ['A']
        q.save()
        print(f"  ✅ Added MCQ choices")
    
    elif q.type == 'MULTI' and not q.choices:
        q.choices = {
            'A': 'Solar',
            'B': 'Wind',
            'C': 'Coal',
            'D': 'Hydro'
        }
        q.correct_answers = ['A', 'B', 'D']
        q.save()
        print(f"  ✅ Added MULTI choices")
    
    elif q.type == 'FIB':
        if not q.correct_answers:
            q.correct_answers = ['3×10^8', '300000000']
            q.save()
            print(f"  ✅ Added FIB correct answers")

print("\n" + "="*60)
print("✅ QUESTIONS UPDATED!")
print("="*60 + "\n")
