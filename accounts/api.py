from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from .tokens import account_activation_token


class RegisterThrottle(AnonRateThrottle):
    rate = '5/hour'


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([RegisterThrottle])
def register(request):
    User = get_user_model()
    data = request.data or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = (data.get('role') or 'student').strip().lower()
    if not username or not password:
        return Response({'error': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'username taken'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, email=email, password=password)
    if role == 'teacher':
        grp, _ = Group.objects.get_or_create(name='Teachers')
        user.groups.add(grp)
    elif role == 'admin':
        user.is_staff = True
        user.is_superuser = True
        user.save(update_fields=['is_staff','is_superuser'])
    
    # Send verification email
    if email:
        token = account_activation_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
        try:
            send_mail(
                subject='Mentara - Verify Your Email',
                message=f'Click to verify: {verification_link}',
                from_email=None,
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception:
            pass
    
    return Response({'id': user.id, 'username': user.username, 'email': user.email, 'role': role, 'message': 'Check email for verification'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    # Expect refresh token in body and blacklist it
    token = request.data.get('refresh')
    if not token:
        return Response({'error': 'refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        refresh = RefreshToken(token)
        refresh.blacklist()
        return Response({'status': 'logged out'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([RegisterThrottle])
def request_password_reset(request):
    """Send password reset email with token"""
    email = request.data.get('email')
    if not email:
        return Response({'error': 'email required'}, status=status.HTTP_400_BAD_REQUEST)
    
    User = get_user_model()
    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        send_mail(
            subject='Mentara - Password Reset',
            message=f'Click to reset your password: {reset_link}',
            from_email=None,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        # Don't reveal if email exists
        return Response({'message': 'If email exists, reset link sent'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """Reset password with uid and token"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response({'error': 'uid, token, and new_password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        User = get_user_model()
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """Verify email with uid and token"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    
    if not all([uid, token]):
        return Response({'error': 'uid and token required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        User = get_user_model()
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({'error': 'Invalid verification link'}, status=status.HTTP_400_BAD_REQUEST)
