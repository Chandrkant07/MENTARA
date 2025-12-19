from django.conf import settings
from django.db import models
from django.utils import timezone
from django.template.defaultfilters import slugify
import os
from datetime import datetime

# -------------------------------
# SUBJECT MODEL
# -------------------------------
class Subject(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# -------------------------------
# CHOICE CONSTANTS
# -------------------------------
LEVEL_CHOICES = (
    ('HL', 'HL'),
    ('SL', 'SL'),
)

PAPER_TYPE_CHOICES = (
    ('specimen', 'Specimen'),
    ('past', 'Past Paper'),
)

QUESTION_TYPE_CHOICES = (
    ('MCQ', 'MCQ'),
    ('WRITTEN', 'Written'),
)

PAPER_NUMBER_CHOICES = (
    ('1', 'Paper 1'),
    ('2', 'Paper 2'),
    ('3', 'Paper 3'),
)




# -------------------------------
# QUESTION PAPER MODEL
# -------------------------------
class QuestionPaper(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='papers')
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    paper_number = models.CharField(max_length=10, choices=PAPER_NUMBER_CHOICES)
    paper_type = models.CharField(max_length=20, choices=PAPER_TYPE_CHOICES)
    variant = models.CharField(max_length=50, blank=True)
    timezone_label = models.CharField(max_length=50, blank=True)
    session = models.CharField(max_length=50, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    title = models.CharField(max_length=255, blank=True)
    duration_minutes = models.PositiveIntegerField(default=90)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=False)
    allowed_to_upload = models.BooleanField(default=True)

    has_difficulty_levels = models.BooleanField(
        default=False,
        help_text="Enable this if you want to assign Easy/Medium/Hard to each question."
    )

    class Meta:
        ordering = ['-year', '-session', 'subject', 'level', 'paper_number']

    def save(self, *args, **kwargs):
        if not self.title or self.title.strip() == "":
            subject_name = self.subject.name if self.subject else "Unknown Subject"
            level = dict(LEVEL_CHOICES).get(self.level, self.level)
            paper_num = dict(PAPER_NUMBER_CHOICES).get(self.paper_number, self.paper_number)
            tz = self.timezone_label or ""
            session = self.session or ""
            year = self.year or ""
            variant = self.variant or ""
            paper_type_display = dict(PAPER_TYPE_CHOICES).get(self.paper_type, self.paper_type)

            parts = [session, str(year), subject_name, level, paper_num, tz, variant, paper_type_display]
            clean_title = " ".join([str(p).strip() for p in parts if str(p).strip()])
            self.title = clean_title.strip()

        super().save(*args, **kwargs)

    def __str__(self):
        subj = self.subject.name if self.subject else "Unknown Subject"
        return f"{subj} → {self.level} → {self.paper_number or self.title} → {self.timezone_label} → {self.session} {self.year} {self.variant}"


class Question(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    paper = models.ForeignKey(QuestionPaper, on_delete=models.CASCADE, related_name='questions')
    order = models.PositiveIntegerField(default=1)
    question_image = models.ImageField(upload_to='question_images/')
    question_text = models.TextField(blank=True)
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPE_CHOICES, default='MCQ')
    difficulty_level = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, blank=True, null=True)

    option_a = models.CharField(max_length=255, blank=True, null=True)
    option_b = models.CharField(max_length=255, blank=True, null=True)
    option_c = models.CharField(max_length=255, blank=True, null=True)
    option_d = models.CharField(max_length=255, blank=True, null=True)
    correct_option = models.CharField(max_length=1, blank=True, null=True)

    marks = models.DecimalField(max_digits=6, decimal_places=2, default=1.0) # <--- new field

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.paper.title} - Q{self.order}"

# -------------------------------
# Answer upload path callable
# -------------------------------
def answer_upload_path(instance, filename):
    """
    Save student answer in: media/answer_uploads/YYYY/MM/DD/username_timestamp.ext
    """
    today = datetime.now()
    import time
    ext = os.path.splitext(filename)[1]
    from django.utils.text import slugify
    unique_name = f"{slugify(instance.user.username)}_{int(time.time())}{ext}"
    return os.path.join(
        'answer_uploads',
        str(today.year),
        str(today.month).zfill(2),
        str(today.day).zfill(2),
        unique_name
    )


# -------------------------------
# ANSWER MODEL
# -------------------------------
class Answer(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    selected_option = models.CharField(max_length=1, blank=True, null=True)
    answer_file = models.FileField(upload_to=answer_upload_path, blank=True, null=True)
    saved_at = models.DateTimeField(auto_now=True)
    submitted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'question')

    def __str__(self):
        return f"{self.user.username} → {self.question}"


# -------------------------------
# PAPER ATTEMPT MODEL
# -------------------------------
class PaperAttempt(models.Model):
    paper = models.ForeignKey(QuestionPaper, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='paper_attempts')
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)
    auto_submitted = models.BooleanField(default=False)
    answer_file = models.FileField(upload_to=answer_upload_path, null=True, blank=True)
    submitted = models.BooleanField(default=False)
    score = models.FloatField(null=True, blank=True)
    max_score = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('paper', 'user')

    def deadline(self):
        return self.started_at + timezone.timedelta(minutes=self.paper.duration_minutes)

    def is_open(self):
        return (not self.submitted) and (timezone.now() < self.deadline())

    def __str__(self):
        return f"{self.user.username} → {self.paper.title} (Started: {self.started_at:%Y-%m-%d %H:%M})"


# -------------------------------
# EVALUATION MODEL
# -------------------------------
class Evaluation(models.Model):
    attempt = models.OneToOneField(PaperAttempt, on_delete=models.CASCADE, related_name='evaluation')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='evaluations')
    marks = models.DecimalField(max_digits=6, decimal_places=2)
    feedback = models.TextField(blank=True, null=True)
    evaluated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Evaluation: {self.attempt.user.username} → {self.attempt.paper.title} ({self.marks})"
