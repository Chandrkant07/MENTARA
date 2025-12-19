from django.contrib import admin
from django.utils.html import format_html
from .models import Topic, Question, Exam, ExamQuestion, Attempt, Response, Badge, LeaderboardEntry

# -------------------------------
# TOPIC ADMIN
# -------------------------------
@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'order', 'created_at')
    list_filter = ('parent', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('parent__id', 'order', 'name')
    list_editable = ('order',)


# -------------------------------
# QUESTION ADMIN
# -------------------------------
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'statement_preview', 'topic', 'type', 'marks', 'difficulty', 'is_active', 'created_at')
    list_filter = ('type', 'difficulty', 'is_active', 'topic', 'created_at')
    search_fields = ('statement', 'tags')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_active',)
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Question Details', {
            'fields': ('topic', 'type', 'statement', 'image')
        }),
        ('Answers', {
            'fields': ('choices', 'correct_answers')
        }),
        ('Meta Information', {
            'fields': ('difficulty', 'marks', 'estimated_time', 'tags', 'attachments', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def statement_preview(self, obj):
        return obj.statement[:80] + '...' if len(obj.statement) > 80 else obj.statement
    statement_preview.short_description = 'Statement'


# -------------------------------
# EXAM QUESTION INLINE
# -------------------------------
class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 1
    fields = ('question', 'order', 'marks_override')
    autocomplete_fields = ['question']


# -------------------------------
# EXAM ADMIN
# -------------------------------
@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'duration_display', 'total_marks', 'passing_marks', 'visibility', 'is_active', 'created_at')
    list_filter = ('topic', 'visibility', 'is_active', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ExamQuestionInline]
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Exam Details', {
            'fields': ('title', 'description', 'topic', 'created_by')
        }),
        ('Settings', {
            'fields': ('duration_seconds', 'total_marks', 'passing_marks', 'shuffle_questions', 'visibility', 'is_active')
        }),
        ('Instructions', {
            'fields': ('instructions',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def duration_display(self, obj):
        minutes = obj.duration_seconds // 60
        return f"{minutes} min"
    duration_display.short_description = 'Duration'


# -------------------------------
# RESPONSE INLINE
# -------------------------------
class ResponseInline(admin.TabularInline):
    model = Response
    extra = 0
    fields = ('question', 'correct', 'time_spent_seconds', 'teacher_mark', 'flagged_for_review')
    readonly_fields = ('question', 'correct', 'time_spent_seconds', 'created_at')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


# -------------------------------
# ATTEMPT ADMIN
# -------------------------------
@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'exam', 'status', 'total_score', 'percentage_display', 'started_at', 'finished_at')
    list_filter = ('status', 'exam', 'started_at')
    search_fields = ('user__username', 'user__email', 'exam__title')
    readonly_fields = ('created_at', 'updated_at', 'started_at', 'finished_at', 'duration_seconds')
    inlines = [ResponseInline]
    ordering = ('-started_at',)
    
    fieldsets = (
        ('Attempt Details', {
            'fields': ('user', 'exam', 'status')
        }),
        ('Timing', {
            'fields': ('started_at', 'finished_at', 'duration_seconds')
        }),
        ('Scoring', {
            'fields': ('total_score', 'percentage', 'rank', 'percentile')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def percentage_display(self, obj):
        return f"{obj.percentage:.2f}%"
    percentage_display.short_description = 'Percentage'
    
    actions = ['recalculate_scores']
    
    @admin.action(description='Recalculate scores for selected attempts')
    def recalculate_scores(self, request, queryset):
        for attempt in queryset:
            attempt.calculate_score()
        self.message_user(request, f"Recalculated scores for {queryset.count()} attempts.")


# -------------------------------
# RESPONSE ADMIN
# -------------------------------
@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'attempt', 'question_preview', 'correct', 'time_spent_seconds', 'teacher_mark', 'flagged_for_review')
    list_filter = ('correct', 'flagged_for_review', 'created_at')
    search_fields = ('attempt__user__username', 'question__statement')
    readonly_fields = ('created_at', 'updated_at', 'attempt', 'question', 'answer_payload', 'correct', 'time_spent_seconds')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Response Details', {
            'fields': ('attempt', 'question', 'answer_payload', 'correct', 'time_spent_seconds')
        }),
        ('Teacher Grading', {
            'fields': ('teacher_mark', 'teacher_feedback', 'flagged_for_review')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def question_preview(self, obj):
        return obj.question.statement[:50] + '...' if len(obj.question.statement) > 50 else obj.question.statement
    question_preview.short_description = 'Question'


# -------------------------------
# BADGE ADMIN
# -------------------------------
@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


# -------------------------------
# LEADERBOARD ADMIN
# -------------------------------
@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'score_metric', 'time_period', 'rank', 'created_at')
    list_filter = ('time_period', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('time_period', 'rank')
