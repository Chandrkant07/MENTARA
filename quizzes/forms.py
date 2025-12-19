from django import forms
from .models import Quiz, Question

DIFFICULTY_CHOICES = [
    ('Easy', 'Easy'),
    ('Medium', 'Medium'),
    ('Hard', 'Hard'),
]

# -------------------------------
# Quiz Form
# -------------------------------
class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ['title', 'subject', 'difficulty']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'subject': forms.TextInput(attrs={'class': 'form-control'}),
            'difficulty': forms.Select(choices=DIFFICULTY_CHOICES, attrs={'class': 'form-control'}),
        }

# -------------------------------
# Question Form
# -------------------------------
class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = [
            'text',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'correct_answer',
            'explanation',
            'image',  # <-- corrected field name
        ]
        widgets = {
            'text': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'option_a': forms.TextInput(attrs={'class': 'form-control'}),
            'option_b': forms.TextInput(attrs={'class': 'form-control'}),
            'option_c': forms.TextInput(attrs={'class': 'form-control'}),
            'option_d': forms.TextInput(attrs={'class': 'form-control'}),
            'correct_answer': forms.Select(
                choices=[('A','A'),('B','B'),('C','C'),('D','D')],
                attrs={'class': 'form-control'}
            ),
            'explanation': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control-file'}),
        }
