# dashboard/models.py
from django.db import models
from django.contrib.auth import get_user_model
from quizzes.models import Quiz, Question, QuizAttempt  # import, do not redefine

User = get_user_model()

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.user.username
