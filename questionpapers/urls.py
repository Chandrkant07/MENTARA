from django.urls import path
from . import views

app_name = 'questionpapers'

urlpatterns = [
    # -------------------------------
    # SUBJECT MANAGEMENT
    # -------------------------------
    path('subjects/add/', views.add_subject, name='add_subject'),

    # -------------------------------
    # PAPER MANAGEMENT
    # -------------------------------
    path('', views.paper_list, name='paper_list'),
    path('create/', views.paper_create, name='paper_create'),
    path('<int:pk>/', views.paper_detail, name='paper_detail'),
    path('<int:pk>/edit/', views.paper_update, name='paper_update'),
    path('<int:pk>/delete/', views.paper_delete, name='paper_delete'),

    # -------------------------------
    # QUESTION UPLOAD (Teacher Side)
    # -------------------------------
    path('upload/<int:paper_id>/', views.upload_questions, name='upload_questions'),

    # -------------------------------
    # STUDENT ATTEMPT FLOW
    # -------------------------------
    path('<int:pk>/start/', views.start_paper, name='start_paper'),  # Starts attempt
    path('take/<int:paper_id>/', views.take_paper, name='take_paper_first'),  # Initial load
    path('take/<int:paper_id>/<int:q_order>/', views.take_paper, name='take_paper'),  # One-question-at-a-time

    # -------------------------------
    # STUDENT ANSWERS (AJAX)
    # -------------------------------
    path('upload_answer/<int:question_id>/', views.upload_written_answer, name='upload_written_answer'),
    path('final_submit/<int:paper_id>/', views.final_submit, name='final_submit'),
    path('load_question/<int:paper_id>/<int:q_order>/', views.load_question, name='load_question'),
    path('save_answer/<int:paper_id>/<int:q_order>/', views.save_answer, name='save_answer'),

    # -------------------------------
    # STUDENT RESULT VIEW
    # -------------------------------
    path('attempt/<int:pk>/result/', views.paper_result, name='paper_result'),

    # =====================================================
    # 🧑‍🏫 TEACHER EVALUATION SYSTEM (NEW)
    # =====================================================
    path('teacher/papers/', views.teacher_paper_list, name='teacher_paper_list'),
    path('teacher/papers/<int:paper_id>/attempts/', views.teacher_attempts, name='teacher_attempts'),
    path('teacher/attempt/<int:attempt_id>/evaluate/', views.evaluate_attempt, name='evaluate_attempt'),
]
