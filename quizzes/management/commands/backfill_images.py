from django.core.management.base import BaseCommand
from quizzes.models import Question
from django.core.files.base import ContentFile
import requests

class Command(BaseCommand):
    help = "Download image_url content and save into image field"

    def handle(self, *args, **options):
        qs = Question.objects.filter(image__isnull=True).exclude(image_url__isnull=True)
        for q in qs:
            try:
                r = requests.get(q.image_url, timeout=8)
                if r.status_code == 200:
                    ext = q.image_url.split('.')[-1].split('?')[0][:5]
                    q.image.save(f"q_{q.pk}.{ext}", ContentFile(r.content), save=True)
                    self.stdout.write(self.style.SUCCESS(f"Saved image for Q {q.pk}"))
                else:
                    self.stdout.write(self.style.WARNING(f"Bad response for Q {q.pk}: {r.status_code}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed {q.pk}: {e}"))
