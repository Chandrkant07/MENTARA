from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    phone = models.CharField(max_length=15, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    grade = models.CharField(max_length=20, blank=True, null=True)
    enrolled_date = models.DateField(auto_now_add=True)
    
    # Gamification fields
    total_points = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Premium features
    is_premium = models.BooleanField(default=False)
    premium_expiry = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    def update_streak(self):
        """Update user streak based on activity"""
        today = timezone.now().date()
        if self.last_activity_date:
            days_diff = (today - self.last_activity_date).days
            if days_diff == 1:
                self.current_streak += 1
                if self.current_streak > self.longest_streak:
                    self.longest_streak = self.current_streak
            elif days_diff > 1:
                self.current_streak = 1
        else:
            self.current_streak = 1
        
        self.last_activity_date = today
        self.save()


class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=100)  # emoji or icon class
    criteria_type = models.CharField(max_length=50)  # 'tests_completed', 'streak', 'score', etc.
    criteria_value = models.IntegerField()
    color = models.CharField(max_length=20, default='#7CE7FF')
    
    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'badge')
    
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
