from django.db import transaction
from django.utils import timezone
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import CustomUser

from .models import LearningAssignment, Material, StudentGroup
from .permissions import IsAdminOrTeacher, IsStudent
from .serializers import (
    LearningAssignmentCreateBulkSerializer,
    LearningAssignmentSerializer,
    MaterialSerializer,
    StudentGroupSerializer,
    StudentGroupUpdateSerializer,
)


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated, IsAdminOrTeacher]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        qs = super().get_queryset().filter(is_active=True)
        curriculum = self.request.query_params.get('curriculum')
        topic = self.request.query_params.get('topic')
        mtype = self.request.query_params.get('type')
        if curriculum:
            qs = qs.filter(curriculum_id=curriculum)
        if topic:
            qs = qs.filter(topic_id=topic)
        if mtype:
            qs = qs.filter(type=mtype)
        return qs


class StudentGroupViewSet(viewsets.ModelViewSet):
    queryset = StudentGroup.objects.all()
    permission_classes = [IsAuthenticated, IsAdminOrTeacher]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return StudentGroupUpdateSerializer
        return StudentGroupSerializer

    def get_queryset(self):
        # Keep it simple: admin sees all; teacher sees groups they created.
        user = self.request.user
        if getattr(user, 'role', '') == 'ADMIN' or user.is_staff:
            return StudentGroup.objects.all()
        return StudentGroup.objects.filter(created_by=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class LearningAssignmentViewSet(viewsets.ModelViewSet):
    queryset = LearningAssignment.objects.all()
    serializer_class = LearningAssignmentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrTeacher]

    def get_queryset(self):
        qs = (
            super()
            .get_queryset()
            .select_related('assigned_to', 'assigned_by', 'material', 'exam')
        )

        user = self.request.user
        role = (getattr(user, 'role', '') or '').upper()
        if not (role == 'ADMIN' or user.is_staff):
            # Teacher can only see assignments they created.
            qs = qs.filter(assigned_by=user)

        include_inactive = self.request.query_params.get('include_inactive')
        if not include_inactive or str(include_inactive).lower() not in ['1', 'true', 'yes']:
            qs = qs.filter(is_active=True)

        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            qs = qs.filter(assigned_to_id=assigned_to)

        atype = self.request.query_params.get('assignment_type')
        if atype:
            qs = qs.filter(assignment_type=atype)

        return qs

    def perform_create(self, serializer):
        role = (getattr(self.request.user, 'role', '') or '').upper()
        serializer.save(assigned_by=self.request.user, assigned_by_role=role)

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request):
        """Create assignments for a list of students and/or a student group."""
        s = LearningAssignmentCreateBulkSerializer(data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        data = s.validated_data

        student_ids = set(data.get('student_ids') or [])
        group_id = data.get('group_id')
        if group_id:
            try:
                group = StudentGroup.objects.get(id=group_id)
            except StudentGroup.DoesNotExist:
                return Response({'detail': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
            student_ids.update(group.students.values_list('id', flat=True))

        students = list(CustomUser.objects.filter(id__in=student_ids, role='STUDENT'))
        if not students:
            return Response({'detail': 'No students found'}, status=status.HTTP_400_BAD_REQUEST)

        role = (getattr(request.user, 'role', '') or '').upper()

        created = []
        with transaction.atomic():
            for student in students:
                created.append(
                    LearningAssignment(
                        assigned_by=request.user,
                        assigned_by_role=role,
                        assigned_to=student,
                        assignment_type=data['assignment_type'],
                        material_id=data.get('material') or None,
                        exam_id=data.get('exam') or None,
                        start_at=data.get('start_at'),
                        end_at=data.get('end_at'),
                        sequence_order=data.get('sequence_order') or 0,
                        priority=data.get('priority') or LearningAssignment.PRIORITY_OPTIONAL,
                        unlock_override=bool(data.get('unlock_override') or False),
                    )
                )
            LearningAssignment.objects.bulk_create(created)

        return Response(LearningAssignmentSerializer(created, many=True, context={'request': request}).data)

    @action(detail=True, methods=['patch'], url_path='unlock')
    def unlock(self, request, pk=None):
        obj = self.get_object()
        obj.unlock_override = True
        obj.save(update_fields=['unlock_override', 'updated_at'])
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=['patch'], url_path='archive')
    def archive(self, request, pk=None):
        obj = self.get_object()
        obj.is_active = False
        obj.archived_at = timezone.now()
        obj.save(update_fields=['is_active', 'archived_at', 'updated_at'])
        return Response(self.get_serializer(obj).data)

    @action(detail=True, methods=['patch'], url_path='restore')
    def restore(self, request, pk=None):
        obj = self.get_object()
        obj.is_active = True
        obj.archived_at = None
        obj.save(update_fields=['is_active', 'archived_at', 'updated_at'])
        return Response(self.get_serializer(obj).data)


class MyAssignmentsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsStudent]

    def list(self, request):
        now = timezone.now()
        assignments = list(
            LearningAssignment.objects.filter(assigned_to=request.user, is_active=True)
            .select_related('material', 'exam', 'assigned_by')
            .order_by('sequence_order', 'id')
        )

        completed_ids = {a.id for a in assignments if a.completed_at is not None}

        # Sequence lock: block items after first incomplete MANDATORY teacher assignment.
        # Admin mandatory items can bypass this (override) to satisfy client requirement.
        blocked = False
        result = []
        for a in assignments:
            time_status = a.compute_time_status(now=now)

            is_admin_override = (a.assigned_by_role or '').upper() == 'ADMIN' and a.priority == LearningAssignment.PRIORITY_MANDATORY
            if a.unlock_override:
                blocked_for_sequence = False
            elif is_admin_override:
                blocked_for_sequence = False
            else:
                blocked_for_sequence = blocked

            status_value = time_status
            if blocked_for_sequence and time_status in [LearningAssignment.STATUS_PENDING, LearningAssignment.STATUS_LOCKED]:
                status_value = LearningAssignment.STATUS_LOCKED

            payload = LearningAssignmentSerializer(a, context={'request': request}).data
            payload['status'] = status_value
            payload['blocked_by_sequence'] = blocked_for_sequence
            payload['is_visible'] = status_value != LearningAssignment.STATUS_LOCKED or a.unlock_override
            result.append(payload)

            if a.priority == LearningAssignment.PRIORITY_MANDATORY and a.id not in completed_ids and not is_admin_override:
                blocked = True

        return Response(result)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        try:
            assignment = LearningAssignment.objects.get(id=pk, assigned_to=request.user)
        except LearningAssignment.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if assignment.assignment_type != LearningAssignment.TYPE_MATERIAL:
            return Response({'detail': 'Only material assignments can be manually completed'}, status=status.HTTP_400_BAD_REQUEST)

        if assignment.completed_at:
            return Response({'detail': 'Already completed'})

        assignment.completed_at = timezone.now()
        assignment.save(update_fields=['completed_at', 'updated_at'])
        return Response(LearningAssignmentSerializer(assignment, context={'request': request}).data)
