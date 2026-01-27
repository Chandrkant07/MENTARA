from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class Material(models.Model):
    TYPE_PDF = 'PDF'
    TYPE_VIDEO = 'VIDEO'
    TYPE_IMAGE = 'IMAGE'
    TYPE_NOTES = 'NOTES'
    TYPE_EXTERNAL_LINK = 'EXTERNAL_LINK'

    TYPE_CHOICES = (
        (TYPE_PDF, 'PDF'),
        (TYPE_VIDEO, 'Video'),
        (TYPE_IMAGE, 'Image'),
        (TYPE_NOTES, 'Notes'),
        (TYPE_EXTERNAL_LINK, 'External link'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    # Either file or url is used depending on type.
    file = models.FileField(upload_to='materials/', blank=True, null=True)
    url = models.URLField(blank=True)

    # Tagging (keep it minimal; can expand later)
    curriculum = models.ForeignKey('exams.Curriculum', on_delete=models.PROTECT, null=True, blank=True)
    topic = models.ForeignKey('exams.Topic', on_delete=models.PROTECT, null=True, blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'type']),
            models.Index(fields=['curriculum', 'topic']),
        ]

    def __str__(self) -> str:
        return self.title


class StudentGroup(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='student_groups', blank=True)

    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ['name']
        unique_together = ('name', 'created_by')

    def __str__(self) -> str:
        return self.name


class LearningAssignment(models.Model):
    TYPE_MATERIAL = 'MATERIAL'
    TYPE_MOCK_TEST = 'MOCK_TEST'
    ASSIGNMENT_TYPE_CHOICES = (
        (TYPE_MATERIAL, 'Material'),
        (TYPE_MOCK_TEST, 'Mock test'),
    )

    PRIORITY_MANDATORY = 'MANDATORY'
    PRIORITY_OPTIONAL = 'OPTIONAL'
    PRIORITY_CHOICES = (
        (PRIORITY_MANDATORY, 'Mandatory'),
        (PRIORITY_OPTIONAL, 'Optional'),
    )

    STATUS_LOCKED = 'LOCKED'
    STATUS_PENDING = 'PENDING'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_EXPIRED = 'EXPIRED'

    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_items',
    )
    assigned_by_role = models.CharField(max_length=20, blank=True, default='')  # ADMIN/TEACHER

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='learning_assignments',
    )

    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPE_CHOICES)
    material = models.ForeignKey('learning.Material', on_delete=models.SET_NULL, null=True, blank=True)
    exam = models.ForeignKey('exams.Exam', on_delete=models.SET_NULL, null=True, blank=True)

    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)

    sequence_order = models.PositiveIntegerField(default=0)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default=PRIORITY_OPTIONAL)

    unlock_override = models.BooleanField(default=False)

    completed_at = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sequence_order', 'id']
        indexes = [
            models.Index(fields=['assigned_to', 'sequence_order']),
            models.Index(fields=['assigned_to', 'start_at', 'end_at']),
            models.Index(fields=['assigned_by_role', 'priority']),
            models.Index(fields=['is_active', 'assigned_by']),
        ]

    def clean(self):
        # Exactly one target should be set.
        if self.assignment_type == self.TYPE_MATERIAL and not self.material_id:
            raise ValueError('Material assignment must have material set')
        if self.assignment_type == self.TYPE_MOCK_TEST and not self.exam_id:
            raise ValueError('Mock test assignment must have exam set')

    def compute_time_status(self, now=None) -> str:
        now = now or timezone.now()
        if self.completed_at:
            return self.STATUS_COMPLETED
        if self.end_at and now > self.end_at:
            return self.STATUS_EXPIRED
        if not self.unlock_override and self.start_at and now < self.start_at:
            return self.STATUS_LOCKED
        return self.STATUS_PENDING

    def __str__(self) -> str:
        return f"{self.assignment_type} → {self.assigned_to_id}"
