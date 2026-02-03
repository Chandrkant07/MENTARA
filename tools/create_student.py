
import os
import sys
from unittest.mock import MagicMock

# Mock pymysql
sys.modules['pymysql'] = MagicMock()

import django

# Add the project root to the path
sys.path.append('d:/mentaramain/MENTARA')

# Force DEBUG=True to use SQLite
os.environ['DEBUG'] = 'True'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')

django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'student'
password = 'student123'
email = 'student@example.com'

print(f"Creating user: {username}")

try:
    if User.objects.filter(username=username).exists():
        print("User already exists!")
        user = User.objects.get(username=username)
    else:
        user = User.objects.create_user(username=username, email=email, password=password)
        print("User created successfully.")

    # Ensure role is set
    user.role = 'STUDENT'
    user.is_active = True
    user.save()
    print(f"User role set to: {user.role}")
    print("Done.")

except Exception as e:
    print(f"Error: {e}")
