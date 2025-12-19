from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


class UserVisibilityTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		User = get_user_model()

		self.teacher = User.objects.create_user(username='t1', password='pw12345', role='TEACHER')
		self.student1 = User.objects.create_user(username='s1', password='pw12345', role='STUDENT')
		self.student2 = User.objects.create_user(username='s2', password='pw12345', role='STUDENT')
		self.admin = User.objects.create_user(username='a1', password='pw12345', role='ADMIN')

	def test_teacher_can_list_students(self):
		self.client.force_authenticate(user=self.teacher)
		resp = self.client.get('/api/users/')
		self.assertEqual(resp.status_code, 200)
		ids = {u['id'] for u in resp.data}
		self.assertIn(self.student1.id, ids)
		self.assertIn(self.student2.id, ids)
		self.assertNotIn(self.teacher.id, ids)
		self.assertNotIn(self.admin.id, ids)

	def test_teacher_cannot_modify_users(self):
		self.client.force_authenticate(user=self.teacher)
		resp = self.client.patch(f'/api/users/{self.student1.id}/', {'first_name': 'X'}, format='json')
		self.assertEqual(resp.status_code, 403)

	def test_student_only_sees_self(self):
		self.client.force_authenticate(user=self.student1)
		resp = self.client.get('/api/users/')
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(len(resp.data), 1)
		self.assertEqual(resp.data[0]['id'], self.student1.id)
