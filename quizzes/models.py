# IB_Django/quizzes/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Quiz(TimeStampedModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    slug = models.SlugField(max_length=255, unique=False, blank=True)
    is_active = models.BooleanField(default=True)
    subject = models.CharField(max_length=100, blank=True)
    difficulty = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['-created_at']

    def soft_delete(self):
        self.is_active = False
        self.save(update_fields=['is_active'])

    def restore(self):
        self.is_active = True
        self.save(update_fields=['is_active'])

    def __str__(self):
        return self.title

    def question_count(self):
        return self.questions.filter(is_active=True).count()


class Question(TimeStampedModel):
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.PROTECT)
    text = models.TextField()
    option_a = models.TextField(blank=True, null=True)
    option_b = models.TextField(blank=True, null=True)
    option_c = models.TextField(blank=True, null=True)
    option_d = models.TextField(blank=True, null=True)
    correct_answer = models.CharField(max_length=10)
    explanation = models.TextField(blank=True)
    image = models.ImageField(upload_to='question_images/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['quiz', 'is_active']),
        ]
        ordering = ['id']

    def soft_delete(self):
        self.is_active = False
        self.save(update_fields=['is_active'])

    def restore(self):
        self.is_active = True
        self.save(update_fields=['is_active'])

    def __str__(self):
        return f"Q: {self.text[:60]}"


class QuizAttempt(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.SET_NULL, null=True, related_name='attempts')
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(default=0)
    max_score = models.FloatField(default=0)


class AttemptAnswer(TimeStampedModel):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.SET_NULL, null=True, related_name='attempt_answers')
    selected_option = models.CharField(max_length=20, blank=True, null=True)
    is_correct = models.BooleanField(default=False)
