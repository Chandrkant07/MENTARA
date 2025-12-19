from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_protect
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response as APIResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Avg
from .forms import StudentSignUpForm
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer, 
    BadgeSerializer, UserBadgeSerializer
)
from .models import Badge, UserBadge

User = get_user_model()


# ============== Template Views (Legacy) ==============
def landing_view(request):
    return render(request, 'landing.html')


@csrf_protect
def signup_view(request):
    if request.method == 'POST':
        form = StudentSignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard:dashboard')
    else:
        form = StudentSignUpForm()
    return render(request, 'accounts/signup.html', {'form': form})


@csrf_protect
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('dashboard:dashboard')
        else:
            return render(request, 'accounts/login.html', {'error': 'Invalid credentials'})
    return render(request, 'accounts/login.html')


def logout_view(request):
    logout(request)
    return redirect('accounts:login')


# ============== REST API Views ==============

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    """Register new student user"""
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return APIResponse({
                'user': UserProfileSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        
        # Return detailed validation errors
        return APIResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Log the error and return a generic error message
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Registration error: {str(e)}")
        return APIResponse({
            'error': 'Registration failed. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """Login with username/email and password"""
    username_or_email = request.data.get('username')
    password = request.data.get('password')
    
    if not username_or_email or not password:
        return APIResponse({
            'error': 'Please provide both username/email and password'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Try to find user by username or email
    user = None
    if '@' in username_or_email:
        try:
            user = User.objects.get(email=username_or_email)
            username = user.username
        except User.DoesNotExist:
            username = username_or_email
    else:
        username = username_or_email
    
    # Authenticate
    user = authenticate(username=username, password=password)
    
    if user is None:
        return APIResponse({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user.is_active:
        return APIResponse({
            'error': 'Account is disabled'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Update streak
    user.update_streak()
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    return APIResponse({
        'user': UserProfileSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    """Logout and blacklist token"""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return APIResponse({'message': 'Successfully logged out'})
    except Exception as e:
        return APIResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    """User profile management"""
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        role = getattr(self.request.user, 'role', None)
        if role == 'ADMIN':
            return User.objects.all()
        if role == 'TEACHER':
            # Teachers can view students (read-only)
            return User.objects.filter(role='STUDENT')
        return User.objects.filter(id=self.request.user.id)

    def _ensure_admin_write(self):
        if getattr(self.request.user, 'role', None) != 'ADMIN':
            raise PermissionDenied('Admin only')

    def create(self, request, *args, **kwargs):
        self._ensure_admin_write()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        self._ensure_admin_write()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._ensure_admin_write()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._ensure_admin_write()
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return APIResponse(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return APIResponse(serializer.data)
        return APIResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user statistics"""
        from exams.models import Attempt
        
        user = request.user
        attempts = Attempt.objects.filter(
            user=user, 
            status__in=['submitted', 'timedout']
        )
        
        stats = {
            'total_tests': attempts.count(),
            'average_score': attempts.aggregate(Avg('percentage'))['percentage__avg'] or 0,
            'total_points': user.total_points,
            'current_streak': user.current_streak,
            'longest_streak': user.longest_streak,
            'badges_earned': user.badges.count(),
        }
        
        return APIResponse(stats)


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """Badge management"""
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([AllowAny])
def fixed_credentials_info(request):
    """Return info about fixed admin/teacher credentials"""
    return APIResponse({
        'admin': {
            'username': 'admin',
            'default_password': 'admin123',
            'note': 'Change password after first login'
        },
        'teacher': {
            'username': 'teacher',
            'default_password': 'teacher123',
            'note': 'Change password after first login'
        },
        'student': {
            'username': 'student',
            'default_password': 'student123',
            'note': 'Change password after first login'
        }
    })
