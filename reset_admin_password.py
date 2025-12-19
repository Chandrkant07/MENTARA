import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Get or create admin user
admin, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@mentara.com',
        'role': 'ADMIN',
        'is_superuser': True,
        'is_staff': True,
        'first_name': 'Admin',
        'last_name': 'User'
    }
)

# Set password
admin.set_password('admin123')
admin.role = 'ADMIN'
admin.is_superuser = True
admin.is_staff = True
admin.save()

if created:
    print(f"✓ Created new admin user: {admin.username}")
else:
    print(f"✓ Updated existing admin user: {admin.username}")

print(f"  Email: {admin.email}")
print(f"  Password: admin123")
print(f"  Role: {admin.role}")
print(f"  Superuser: {admin.is_superuser}")
print(f"  Staff: {admin.is_staff}")
