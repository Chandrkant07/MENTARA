from django.contrib import admin
from .models import Subject, QuestionPaper, PaperAttempt, Question, Answer

# -------------------------------
# SUBJECT ADMIN
# -------------------------------
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)
    list_display = ("name", "slug")


# -------------------------------
# INLINE QUESTION MANAGEMENT
# -------------------------------
class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = (
        "order", "question_image", "question_type",
        "option_a", "option_b", "option_c", "option_d", "correct_option",
    )
    readonly_fields = ("created_at",)


# -------------------------------
# QUESTION PAPER ADMIN
# -------------------------------
@admin.register(QuestionPaper)
class QuestionPaperAdmin(admin.ModelAdmin):
    list_display = ("title", "subject", "level", "paper_number", "year", "is_published", "created_by")
    list_filter = ("subject", "level", "year", "is_published", "paper_type")
    search_fields = ("title", "paper_number", "variant", "session", "timezone_label")
    inlines = [QuestionInline]
    ordering = ("-year", "subject")
    fieldsets = (
        ("Basic Info", {
            "fields": ("subject", "level", "paper_number", "paper_type", "variant", "year", "session", "timezone_label")
        }),
        ("Additional", {
            "fields": ("title", "duration_minutes", "is_published", "allowed_to_upload")
        }),
    )


# -------------------------------
# QUESTION ADMIN (standalone view)
# -------------------------------
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("paper", "order", "question_type", "created_at")
    list_filter = ("question_type", "paper__subject")
    search_fields = ("paper__title", "question_text")
    ordering = ("paper", "order")


# -------------------------------
# ANSWER ADMIN
# -------------------------------
@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ("user", "question", "selected_option", "submitted", "saved_at")
    list_filter = ("submitted", "question__question_type")
    search_fields = ("user__username", "question__paper__title")
    ordering = ("-saved_at",)


# -------------------------------
# PAPER ATTEMPT ADMIN
# -------------------------------
@admin.register(PaperAttempt)
class PaperAttemptAdmin(admin.ModelAdmin):
    list_display = ("paper", "user", "started_at", "finished_at", "submitted", "auto_submitted")
    list_filter = ("submitted", "auto_submitted", "paper__subject")
    search_fields = ("paper__title", "user__username")
    ordering = ("-started_at",)
