from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Badge, UserBadge

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=15)
    grade = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=20)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'phone', 'grade']
    
    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        # Use create_user to properly hash password
        user = User.objects.create_user(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            password=password,
            **validated_data
        )
        user.role = 'STUDENT'
        user.save()
        return user


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'earned_at']


class UserProfileSerializer(serializers.ModelSerializer):
    badges = UserBadgeSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'role', 'phone', 'avatar', 'bio', 'grade', 'enrolled_date',
                 'total_points', 'current_streak', 'longest_streak', 
                 'is_premium', 'premium_expiry', 'badges']
        read_only_fields = ['id', 'enrolled_date', 'total_points', 
                           'current_streak', 'longest_streak', 'badges']


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar', 'role']
