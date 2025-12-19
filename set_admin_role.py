import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ib_project.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Update all superusers to have ADMIN role
admins = User.objects.filter(is_superuser=True)
for admin in admins:
    admin.role = 'ADMIN'
    admin.save()
    print(f'Updated {admin.username} (ID: {admin.id}) - Role: {admin.role}')

print(f'\nTotal superusers updated: {admins.count()}')
