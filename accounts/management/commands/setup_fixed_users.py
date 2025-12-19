from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import Badge

User = get_user_model()


class Command(BaseCommand):
    help = 'Setup fixed admin and teacher accounts + initial badges'
    
    def handle(self, *args, **options):
        # Create Admin
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mentara.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS(
                '✅ Created admin user - username: admin, password: admin123'
            ))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))
        
        # Create Teacher
        teacher, created = User.objects.get_or_create(
            username='teacher',
            defaults={
                'email': 'teacher@mentara.com',
                'first_name': 'Teacher',
                'last_name': 'Demo',
                'role': 'TEACHER',
                'is_staff': True,
            }
        )
        if created:
            teacher.set_password('teacher123')
            teacher.save()
            self.stdout.write(self.style.SUCCESS(
                '✅ Created teacher user - username: teacher, password: teacher123'
            ))
        else:
            self.stdout.write(self.style.WARNING('Teacher user already exists'))

        # Create Student
        student, created = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@mentara.com',
                'first_name': 'Student',
                'last_name': 'Demo',
                'role': 'STUDENT',
                'is_staff': False,
                'is_superuser': False,
            }
        )
        if created:
            student.set_password('student123')
            student.save()
            self.stdout.write(self.style.SUCCESS(
                '✅ Created student user - username: student, password: student123'
            ))
        else:
            self.stdout.write(self.style.WARNING('Student user already exists'))
        
        # Create initial badges
        badges_data = [
            {
                'name': 'First Steps',
                'description': 'Complete your first test',
                'icon': '🎯',
                'criteria_type': 'tests_completed',
                'criteria_value': 1,
                'color': '#7CE7FF'
            },
            {
                'name': 'Test Master',
                'description': 'Complete 10 tests',
                'icon': '🏆',
                'criteria_type': 'tests_completed',
                'criteria_value': 10,
                'color': '#FFD700'
            },
            {
                'name': 'Week Warrior',
                'description': 'Maintain a 7-day streak',
                'icon': '🔥',
                'criteria_type': 'streak',
                'criteria_value': 7,
                'color': '#FF6B6B'
            },
            {
                'name': 'Perfect Score',
                'description': 'Score 100% in any test',
                'icon': '⭐',
                'criteria_type': 'score',
                'criteria_value': 100,
                'color': '#A6FFCB'
            },
            {
                'name': 'Speed Demon',
                'description': 'Complete a test in under 30 minutes',
                'icon': '⚡',
                'criteria_type': 'speed',
                'criteria_value': 1800,
                'color': '#00C2A8'
            }
        ]
        
        created_count = 0
        for badge_data in badges_data:
            badge, created = Badge.objects.get_or_create(
                name=badge_data['name'],
                defaults=badge_data
            )
            if created:
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'✅ Created {created_count} badges'
        ))
        
        self.stdout.write(self.style.SUCCESS(
            '\\n🎉 Setup complete! Fixed credentials:\\n'
            '   Admin: username=admin, password=admin123\\n'
            '   Teacher: username=teacher, password=teacher123\\n'
            '   Student: username=student, password=student123\n'
            '   ⚠️  Change passwords after first login!'
        ))
