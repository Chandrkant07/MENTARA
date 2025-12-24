#!/usr/bin/env python
"""Test registration endpoint"""
import os
import django
import sys


def _running_under_pytest() -> bool:
    return (
        'PYTEST_CURRENT_TEST' in os.environ
        or any(m == 'pytest' or m.startswith('pytest.') for m in sys.modules)
    )


if _running_under_pytest():
    import pytest  # type: ignore

    pytest.skip(
        'Standalone integration script (calls Django views directly). Run directly, not via pytest.',
        allow_module_level=True,
    )

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
django.setup()

from django.test import RequestFactory
from accounts.views import api_register
from django.contrib.auth import get_user_model
import json

User = get_user_model()

def test_registration():
    """Test user registration"""
    
    # Delete test user if exists
    User.objects.filter(username='testuser999').delete()
    User.objects.filter(email='test999@example.com').delete()
    
    # Create request
    factory = RequestFactory()
    data = {
        'username': 'testuser999',
        'email': 'test999@example.com',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User',
        'grade': '11'
    }
    
    request = factory.post(
        '/api/auth/register/',
        data=json.dumps(data),
        content_type='application/json'
    )
    
    # Call view
    response = api_register(request)
    
    print(f"\n{'='*60}")
    print(f"Registration Test Results")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    print(f"Response Data: {response.data}")
    print(f"{'='*60}\n")
    
    if response.status_code == 201:
        print("✅ Registration SUCCESSFUL!")
        user = User.objects.get(username='testuser999')
        print(f"   - User created: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - Role: {user.role}")
        print(f"   - Grade: {user.grade}")
        print(f"   - Password is hashed: {user.password.startswith('pbkdf2_')}")
        
        # Verify password
        if user.check_password('testpass123'):
            print("   - Password verification: ✅ PASSED")
        else:
            print("   - Password verification: ❌ FAILED")
            
        # Clean up
        user.delete()
        print("\n✅ Test user cleaned up")
        return True
    else:
        print("❌ Registration FAILED!")
        print(f"   Errors: {response.data}")
        return False

if __name__ == '__main__':
    try:
        success = test_registration()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
