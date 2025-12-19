from django import forms
from .models import Subject, QuestionPaper, PaperAttempt, Question, Answer, Evaluation

# -------------------------------
# SUBJECT FORM
# -------------------------------
class SubjectForm(forms.ModelForm):
    class Meta:
        model = Subject
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': 'e.g. Physics, Mathematics',
                'class': 'form-control'
            }),
        }


# -------------------------------
# QUESTION PAPER FORM
# -------------------------------
class QuestionPaperForm(forms.ModelForm):
    class Meta:
        model = QuestionPaper
        fields = [
            'subject', 'level', 'paper_number', 'paper_type',
            'variant', 'timezone_label', 'session',
            'year', 'title', 'duration_minutes', 'is_published',
            'has_difficulty_levels'
        ]
        widgets = {
            'subject': forms.Select(attrs={'class': 'form-control'}),
            'level': forms.Select(attrs={'class': 'form-control'}),
            'paper_number': forms.Select(attrs={'class': 'form-control'}),
            'paper_type': forms.Select(attrs={'class': 'form-control'}),
            'variant': forms.TextInput(attrs={'class': 'form-control'}),
            'timezone_label': forms.TextInput(attrs={'class': 'form-control'}),
            'session': forms.TextInput(attrs={'class': 'form-control'}),
            'year': forms.NumberInput(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'duration_minutes': forms.NumberInput(attrs={'class': 'form-control'}),
            'is_published': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'has_difficulty_levels': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['variant'].required = False
        self.fields['timezone_label'].required = False
        self.fields['session'].required = False
        self.fields['has_difficulty_levels'].label = "Enable difficulty levels (Easy / Medium / Hard)"


# -------------------------------
# QUESTION FORM (Per-question upload)
# -------------------------------
class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = [
            'order', 'question_image', 'question_type', 'marks',
            'option_a', 'option_b', 'option_c', 'option_d', 'correct_option',
            'difficulty_level'
        ]
        widgets = {
            'order': forms.NumberInput(attrs={'class': 'form-control', 'min': 1}),
            'question_type': forms.Select(attrs={'class': 'form-control'}),
            'marks': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': 0.5,
                'min': 0,
                'placeholder': 'Enter marks for this question'
            }),
            'option_a': forms.TextInput(attrs={'class': 'form-control'}),
            'option_b': forms.TextInput(attrs={'class': 'form-control'}),
            'option_c': forms.TextInput(attrs={'class': 'form-control'}),
            'option_d': forms.TextInput(attrs={'class': 'form-control'}),
            'correct_option': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter A/B/C/D for correct answer'
            }),
            'question_image': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'difficulty_level': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        paper = kwargs.pop('paper', None)
        super().__init__(*args, **kwargs)
        if paper and not paper.has_difficulty_levels:
            self.fields.pop('difficulty_level', None)
        else:
            self.fields['difficulty_level'].required = False


# -------------------------------
# ANSWER UPLOAD FORM (Students)
# -------------------------------
class AnswerUploadForm(forms.ModelForm):
    class Meta:
        model = Answer
        fields = ['selected_option', 'answer_file']
        widgets = {
            'selected_option': forms.RadioSelect(choices=[
                ('A', 'A'),
                ('B', 'B'),
                ('C', 'C'),
                ('D', 'D'),
            ]),
            'answer_file': forms.ClearableFileInput(attrs={'class': 'form-control'}),
        }


# -------------------------------
# PAPER ATTEMPT FORM
# -------------------------------
class SubmitAnswerForm(forms.ModelForm):
    class Meta:
        model = PaperAttempt
        fields = ['answer_file']
        widgets = {
            'answer_file': forms.ClearableFileInput(attrs={'class': 'form-control'}),
        }


# ==========================================================
# 🧑‍🏫 EVALUATION FORM (Teacher marks & feedback)
# ==========================================================
class EvaluationForm(forms.ModelForm):
    class Meta:
        model = Evaluation
        fields = ['marks', 'feedback']
        widgets = {
            'marks': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': 0,
                'step': 0.5,
                'placeholder': 'Enter marks'
            }),
            'feedback': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Enter feedback or comments (optional)'
            }),
        }
