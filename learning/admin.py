from django.contrib import admin

from .models import LearningAssignment, Material, StudentGroup


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'type', 'curriculum', 'topic', 'is_active', 'created_at')
    list_filter = ('type', 'is_active', 'curriculum')
    search_fields = ('title', 'description')


@admin.register(StudentGroup)
class StudentGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_by', 'created_at')
    search_fields = ('name',)


@admin.register(LearningAssignment)
class LearningAssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'assignment_type', 'assigned_by_role', 'assigned_to', 'priority', 'sequence_order', 'start_at', 'end_at', 'completed_at')
    list_filter = ('assignment_type', 'assigned_by_role', 'priority')
    search_fields = ('assigned_to__username', 'assigned_by__username')
