from django.contrib import admin
from .models import StudentProfile

# -------------------------------
# STUDENT PROFILE ADMIN
# -------------------------------
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio_preview')
    search_fields = ('user__username', 'user__email', 'bio')
    
    def bio_preview(self, obj):
        return obj.bio[:50] + '...' if len(obj.bio) > 50 else obj.bio
    bio_preview.short_description = 'Bio'
