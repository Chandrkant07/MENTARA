from rest_framework.permissions import BasePermission, SAFE_METHODS


def _role(user):
    return (getattr(user, 'role', '') or '').upper()


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (_role(request.user) == 'ADMIN' or request.user.is_staff))


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _role(request.user) == 'TEACHER')


class IsAdminOrTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (_role(request.user) in ['ADMIN', 'TEACHER'] or request.user.is_staff))


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _role(request.user) == 'STUDENT')


class ReadOnlyForTeacher(BasePermission):
    """Allow safe methods for teacher, full for admin."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if _role(request.user) == 'ADMIN' or request.user.is_staff:
            return True
        if _role(request.user) == 'TEACHER':
            return request.method in SAFE_METHODS
        return False
