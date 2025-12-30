from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.dateparse import parse_date

from exams.models import Curriculum, Topic


@dataclass(frozen=True)
class Selection:
    ids: Optional[list[int]]
    name_contains: Optional[str]
    created_before: Optional[str]
    all_active: bool


def _parse_ids(raw: Optional[str]) -> Optional[list[int]]:
    if not raw:
        return None
    parts = [p.strip() for p in raw.split(',') if p.strip()]
    if not parts:
        return None
    ids: list[int] = []
    for p in parts:
        try:
            ids.append(int(p))
        except ValueError as exc:
            raise CommandError(f"Invalid id '{p}' in --ids") from exc
    return sorted(set(ids))


class Command(BaseCommand):
    help = (
        "Archive (soft-delete) curriculums safely by setting is_active=False. "
        "Dry-run by default; use --apply with --confirm to make changes."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--ids',
            type=str,
            default=None,
            help='Comma-separated curriculum IDs to archive (e.g. 1,2,3).',
        )
        parser.add_argument(
            '--name-contains',
            type=str,
            default=None,
            help='Match curriculums where name contains this string (case-insensitive).',
        )
        parser.add_argument(
            '--created-before',
            type=str,
            default=None,
            help='Match curriculums created before this date (YYYY-MM-DD).',
        )
        parser.add_argument(
            '--all-active',
            action='store_true',
            help='Select ALL active curriculums (dangerous; use with dry-run first).',
        )
        parser.add_argument(
            '--archive-topics',
            action='store_true',
            help='Also archive Topics under selected curriculums (sets Topic.is_active=False).',
        )
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Actually apply changes (default is dry-run).',
        )
        parser.add_argument(
            '--confirm',
            type=str,
            default=None,
            help='Required when using --apply. Use ARCHIVE (or ARCHIVE_ALL for --all-active).',
        )

    def handle(self, *args, **options):
        selection = Selection(
            ids=_parse_ids(options.get('ids')),
            name_contains=(options.get('name_contains') or '').strip() or None,
            created_before=(options.get('created_before') or '').strip() or None,
            all_active=bool(options.get('all_active')),
        )
        archive_topics = bool(options.get('archive_topics'))
        apply = bool(options.get('apply'))
        confirm = (options.get('confirm') or '').strip() or None

        if not selection.all_active and not selection.ids and not selection.name_contains and not selection.created_before:
            raise CommandError(
                'Refusing to run without a selection. Provide --ids, --name-contains, --created-before, or --all-active.'
            )

        if selection.all_active and (selection.ids or selection.name_contains or selection.created_before):
            raise CommandError('Do not combine --all-active with other selectors.')

        if selection.created_before:
            dt = parse_date(selection.created_before)
            if not dt:
                raise CommandError('Invalid --created-before date. Expected YYYY-MM-DD.')

        qs = Curriculum.objects.filter(is_active=True)

        if selection.all_active:
            qs = qs
        else:
            if selection.ids:
                qs = qs.filter(id__in=selection.ids)
            if selection.name_contains:
                qs = qs.filter(name__icontains=selection.name_contains)
            if selection.created_before:
                dt = parse_date(selection.created_before)
                qs = qs.filter(created_at__date__lt=dt)

        curriculums = list(qs.order_by('order', 'name'))

        if not curriculums:
            self.stdout.write(self.style.WARNING('No matching active curriculums found. Nothing to do.'))
            return

        self.stdout.write('Selected curriculums:')
        for c in curriculums:
            self.stdout.write(f"- id={c.id} name={c.name} created_at={c.created_at:%Y-%m-%d}")

        if not apply:
            self.stdout.write(self.style.WARNING('\nDRY-RUN: no changes applied (use --apply --confirm ...).'))
            if archive_topics:
                topic_count = Topic.objects.filter(curriculum_id__in=[c.id for c in curriculums], is_active=True).count()
                self.stdout.write(f"Would also archive {topic_count} active topic(s) under these curriculums.")
            return

        if selection.all_active:
            if confirm != 'ARCHIVE_ALL':
                raise CommandError("--apply with --all-active requires --confirm ARCHIVE_ALL")
        else:
            if confirm != 'ARCHIVE':
                raise CommandError("--apply requires --confirm ARCHIVE")

        curriculum_ids = [c.id for c in curriculums]

        with transaction.atomic():
            updated = Curriculum.objects.filter(id__in=curriculum_ids, is_active=True).update(is_active=False)
            self.stdout.write(self.style.SUCCESS(f"Archived {updated} curriculum(s)."))

            if archive_topics:
                topic_updated = Topic.objects.filter(curriculum_id__in=curriculum_ids, is_active=True).update(is_active=False)
                self.stdout.write(self.style.SUCCESS(f"Archived {topic_updated} topic(s) under those curriculums."))
