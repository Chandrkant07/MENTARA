"""Standalone API smoke-test script.

NOTE: This is intentionally *not* a Django unit test.
It makes real HTTP requests to a running dev server.

Run manually:
  python test_admin_api.py
"""


def main():
    import os
    import django
    import requests

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
    django.setup()

    from django.contrib.auth import get_user_model

    User = get_user_model()

    admin = User.objects.filter(is_superuser=True).first()
    if not admin:
        print("No superuser found. Create one with: python manage.py createsuperuser")
        return

    print(f"Admin User: {admin.username}")
    print(f"Role: {admin.role}")
    print(f"Is Superuser: {admin.is_superuser}")
    print(f"Is Staff: {admin.is_staff}")

    print("\nTesting authentication...")
    login_response = requests.post('http://127.0.0.1:8000/api/auth/login/', json={
        'username': admin.username,
        'password': 'admin123'
    })

    if login_response.status_code != 200:
        print(f"✗ Login failed: {login_response.status_code}")
        print(f"  Response: {login_response.text}")
        print("\nNote: Update the password in this script or reset it:")
        print("  python manage.py changepassword <admin_username>")
        return

    tokens = login_response.json()
    access_token = tokens.get('access')
    print("✓ Login successful! Token obtained.")

    headers = {'Authorization': f'Bearer {access_token}'}
    print("\nTesting API endpoints...")

    overview = requests.get('http://127.0.0.1:8000/api/admin/overview/', headers=headers)
    print(f"  /api/admin/overview/ - Status: {overview.status_code}")

    topics = requests.get('http://127.0.0.1:8000/api/topics/', headers=headers)
    print(f"  /api/topics/ - Status: {topics.status_code}")

    exams = requests.get('http://127.0.0.1:8000/api/exams/', headers=headers)
    print(f"  /api/exams/ - Status: {exams.status_code}")

    questions = requests.get('http://127.0.0.1:8000/api/questions/', headers=headers)
    print(f"  /api/questions/ - Status: {questions.status_code}")

    users = requests.get('http://127.0.0.1:8000/api/admin/users/', headers=headers)
    print(f"  /api/admin/users/ - Status: {users.status_code}")


if __name__ == '__main__':
    main()
