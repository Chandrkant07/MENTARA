from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'accounts'

# REST API Router
router = DefaultRouter()
router.register('users', views.UserProfileViewSet, basename='user')
router.register('badges', views.BadgeViewSet, basename='badge')

urlpatterns = [
    # Template views (legacy)
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    path('auth/register/', views.api_register, name='api_register'),
    path('auth/login/', views.api_login, name='api_login'),
    path('auth/logout/', views.api_logout, name='api_logout'),
    path('auth/credentials/', views.fixed_credentials_info, name='fixed_credentials'),
    path('', include(router.urls)),
]
