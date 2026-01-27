from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LearningAssignmentViewSet, MaterialViewSet, MyAssignmentsViewSet, StudentGroupViewSet

router = DefaultRouter()
router.register('materials', MaterialViewSet, basename='materials')
router.register('student-groups', StudentGroupViewSet, basename='student-groups')
router.register('assignments', LearningAssignmentViewSet, basename='assignments')

# ViewSet without router for /my/assignments/
my_router = DefaultRouter()
my_router.register('my/assignments', MyAssignmentsViewSet, basename='my-assignments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(my_router.urls)),
]
