
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

from django.contrib.auth import get_user_model, authenticate
User = get_user_model()

username = 'student'
password = 'student123'

print(f"Checking user: {username}")
print(f"Using database: {django.conf.settings.DATABASES['default']['ENGINE']}")

try:
    user = User.objects.get(username=username)
    print(f"User found: {user}")
    print(f"User active: {user.is_active}")
    print(f"User role: {getattr(user, 'role', 'N/A')}")
    
    auth_user = authenticate(username=username, password=password)
    if auth_user:
        print("Authentication SUCCESS")
    else:
        print("Authentication FAILED")
        
except User.DoesNotExist:
    print("User does NOT exist")
except Exception as e:
    print(f"Error: {e}")
