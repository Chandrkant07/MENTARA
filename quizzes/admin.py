# IB_Django/quizzes/admin.py

from django.contrib import admin
from .models import Quiz, Question, QuizAttempt, AttemptAnswer

# -------------------------------
# Admin Actions
# -------------------------------
@admin.action(description="Soft delete selected items")
def soft_delete(modeladmin, request, queryset):
    for obj in queryset:
        obj.soft_delete()

@admin.action(description="Restore selected items")
def restore(modeladmin, request, queryset):
    for obj in queryset:
        obj.restore()

# -------------------------------
# Question Admin
# -------------------------------
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'quiz', 'short_text', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'quiz')
    search_fields = ('text', 'quiz__title')
    actions = [soft_delete, restore]

    def short_text(self, obj):
        return obj.text[:60]
    short_text.short_description = 'Question'

# -------------------------------
# Quiz Admin
# -------------------------------
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'subject', 'difficulty', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'subject', 'difficulty')
    search_fields = ('title', 'subject')
    actions = [soft_delete, restore]

# -------------------------------
# QuizAttempt Admin
# -------------------------------
@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'quiz', 'score', 'max_score', 'started_at', 'finished_at')
    list_filter = ('quiz', 'user')
    search_fields = ('user__username', 'quiz__title')

# -------------------------------
# AttemptAnswer Admin
# -------------------------------
@admin.register(AttemptAnswer)
class AttemptAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'attempt', 'question', 'selected_option', 'is_correct', 'created_at')
    list_filter = ('is_correct',)
    search_fields = ('question__text', 'attempt__user__username')
