from django.urls import path
from . import views

app_name = "quizzes"

urlpatterns = [
    path('', views.quiz_list, name='quiz_list'),
    path('start/<int:quiz_id>/', views.start_quiz, name='start_quiz'),
    path('take/<int:attempt_id>/<int:question_index>/', views.take_question, name='take_question'),
    path('result/<int:attempt_id>/', views.quiz_result, name='quiz_result'),
    path('upload_excel/', views.upload_quiz_excel, name='upload_quiz_excel'),

    # management routes (staff only)
    path('manage/<int:quiz_id>/', views.manage_quiz, name='manage_quiz'),
    path('quiz/edit/<int:quiz_id>/', views.edit_quiz, name='edit_quiz'),
    path('quiz/delete/<int:quiz_id>/', views.delete_quiz, name='delete_quiz'),
    path('question/add/<int:quiz_id>/', views.add_question, name='add_question'),
    path('question/edit/<int:question_id>/', views.edit_question, name='edit_question'),
    path('question/delete/<int:question_id>/', views.delete_question, name='delete_question'),
]
