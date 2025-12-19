from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

User = get_user_model()

# Actions
@admin.action(description="Deactivate selected users (set is_active=False)")
def deactivate_users(modeladmin, request, queryset):
    queryset.exclude(is_superuser=True).update(is_active=False)

@admin.action(description="Activate selected users (set is_active=True)")
def activate_users(modeladmin, request, queryset):
    queryset.update(is_active=True)

class CustomUserAdmin(BaseUserAdmin):
    list_display = (
        "username", "email", "is_staff", "is_superuser", "is_active", "last_login", "date_joined"
    )
    list_filter = ("is_staff", "is_superuser", "is_active", "date_joined")
    search_fields = ("username", "email")
    ordering = ("-date_joined",)
    actions = [deactivate_users, activate_users]

    # Prevent superuser from deleting themselves
    def has_delete_permission(self, request, obj=None):
        if obj and obj == request.user:
            return False
        return request.user.is_superuser

    # Make fields readonly for non-superuser staff
    def get_readonly_fields(self, request, obj=None):
        readonly = []
        if not request.user.is_superuser:
            readonly += ["is_superuser", "is_staff"]
        return readonly

# Unregister and register safely
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

admin.site.register(User, CustomUserAdmin)

# Admin site titles
admin.site.site_header = "My Project Admin"
admin.site.site_title = "Admin — My Project"
admin.site.index_title = "Administration"
