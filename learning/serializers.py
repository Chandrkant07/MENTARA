from django.utils import timezone
from rest_framework import serializers

from accounts.models import CustomUser
from accounts.serializers import UserMinimalSerializer

from .models import LearningAssignment, Material, StudentGroup


class MaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id',
            'title',
            'description',
            'type',
            'file',
            'file_url',
            'url',
            'curriculum',
            'topic',
            'created_by',
            'created_at',
            'is_active',
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_file_url(self, obj):
        try:
            f = obj.file
            if not f:
                return None
            request = self.context.get('request')
            url = f.url
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return None


class StudentGroupSerializer(serializers.ModelSerializer):
    student_ids = serializers.PrimaryKeyRelatedField(source='students', many=True, read_only=True)

    class Meta:
        model = StudentGroup
        fields = ['id', 'name', 'description', 'created_by', 'created_at', 'student_ids']
        read_only_fields = ['created_by', 'created_at', 'student_ids']


class StudentGroupUpdateSerializer(serializers.ModelSerializer):
    students = serializers.PrimaryKeyRelatedField(
        many=True,
        required=False,
        queryset=CustomUser.objects.none(),
    )

    class Meta:
        model = StudentGroup
        fields = ['id', 'name', 'description', 'students']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['students'].queryset = CustomUser.objects.filter(role='STUDENT')


class LearningAssignmentSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    material_info = serializers.SerializerMethodField()
    exam_info = serializers.SerializerMethodField()
    assigned_to_info = serializers.SerializerMethodField()
    assigned_by_info = serializers.SerializerMethodField()

    class Meta:
        model = LearningAssignment
        fields = [
            'id',
            'assigned_by',
            'assigned_by_role',
            'assigned_by_info',
            'assigned_to',
            'assigned_to_info',
            'assignment_type',
            'material',
            'material_info',
            'exam',
            'exam_info',
            'start_at',
            'end_at',
            'sequence_order',
            'priority',
            'unlock_override',
            'completed_at',
            'is_active',
            'archived_at',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['assigned_by', 'assigned_by_role', 'completed_at', 'created_at', 'updated_at', 'archived_at']

    def get_status(self, obj):
        return obj.compute_time_status(now=timezone.now())

    def get_material_info(self, obj):
        m = getattr(obj, 'material', None)
        if not m:
            return None
        return MaterialSerializer(m, context=self.context).data

    def get_exam_info(self, obj):
        e = getattr(obj, 'exam', None)
        if not e:
            return None
        return {
            'id': e.id,
            'title': getattr(e, 'title', None),
            'duration_seconds': getattr(e, 'duration_seconds', None),
            'total_marks': getattr(e, 'total_marks', None),
            'passing_marks': getattr(e, 'passing_marks', None),
            'topic_id': getattr(getattr(e, 'topic', None), 'id', None),
        }

    def get_assigned_to_info(self, obj):
        u = getattr(obj, 'assigned_to', None)
        if not u:
            return None
        return UserMinimalSerializer(u, context=self.context).data

    def get_assigned_by_info(self, obj):
        u = getattr(obj, 'assigned_by', None)
        if not u:
            return None
        return UserMinimalSerializer(u, context=self.context).data


class LearningAssignmentCreateBulkSerializer(serializers.Serializer):
    # Accept either student_ids or group_id (or both). Creates one assignment per student.
    student_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    group_id = serializers.IntegerField(required=False)

    assignment_type = serializers.ChoiceField(choices=LearningAssignment.ASSIGNMENT_TYPE_CHOICES)
    material = serializers.IntegerField(required=False, allow_null=True)
    exam = serializers.IntegerField(required=False, allow_null=True)

    start_at = serializers.DateTimeField(required=False, allow_null=True)
    end_at = serializers.DateTimeField(required=False, allow_null=True)
    sequence_order = serializers.IntegerField(required=False)
    priority = serializers.ChoiceField(choices=LearningAssignment.PRIORITY_CHOICES, required=False)
    unlock_override = serializers.BooleanField(required=False)

    def validate(self, attrs):
        student_ids = attrs.get('student_ids') or []
        group_id = attrs.get('group_id')
        if not student_ids and not group_id:
            raise serializers.ValidationError('Provide student_ids or group_id')

        atype = attrs.get('assignment_type')
        if atype == LearningAssignment.TYPE_MATERIAL and not attrs.get('material'):
            raise serializers.ValidationError('Material assignment requires material')
        if atype == LearningAssignment.TYPE_MOCK_TEST and not attrs.get('exam'):
            raise serializers.ValidationError('Mock test assignment requires exam')

        start_at = attrs.get('start_at')
        end_at = attrs.get('end_at')
        if start_at and end_at and end_at <= start_at:
            raise serializers.ValidationError('end_at must be after start_at')

        return attrs
