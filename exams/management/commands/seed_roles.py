from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

class Command(BaseCommand):
    help = 'Seed default roles: Admin (use is_staff), Teachers group and basic permissions.'

    def handle(self, *args, **options):
        teachers, created = Group.objects.get_or_create(name='Teachers')
        perms = Permission.objects.filter(codename__in=[
            'add_user','change_user','view_user',
        ])
        teachers.permissions.set(perms)
        self.stdout.write(self.style.SUCCESS('Seeded Teachers group with basic permissions'))
