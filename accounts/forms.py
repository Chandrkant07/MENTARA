from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class StudentSignUpForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'grade', 'password1', 'password2')
