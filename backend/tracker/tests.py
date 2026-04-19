from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock
from .models import *
from datetime import timedelta

User = get_user_model()


class UserModelTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
            email="test@test.com",
            supabase_id="mock-uuid-1234",
        )

    @patch("tracker.models.create_client")
    def testDeleteUserSupabaseSync(self, mock_create_client):

        mock_supabase = MagicMock()
        mock_create_client.return_value = mock_supabase

        self.user.delete()

        self.assertFalse(User.objects.filter(username="testuser").exists())

        mock_create_client.assert_called_once()
        mock_supabase.auth.admin.delete_user.assert_called_once_with("mock-uuid-1234")


class WorkoutTemplateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser")
        self.client.force_authenticate(user=self.user)

        self.template_data = {
            "name": "Push Day",
            "notes": "Focus on chest and triceps",
            "exercise_templates": [
                {
                    "name": "Bench Press",
                    "rest_period": timedelta(seconds=120),
                    "notes": "Keep shoulders back",
                    "increment_step": 2.5,
                    "set_templates": [
                        {"min_reps": 8, "max_reps": 10, "notes": "Set 1"},
                        {"min_reps": 8, "max_reps": 10, "notes": "Set 2"},
                    ],
                }
            ],
        }

    def testCreateTemplateWithExercises(self):
        template = WorkoutTemplate.create_with_exercises(
            user=self.user, template_data=self.template_data
        )

        self.assertEqual(WorkoutTemplate.objects.count(), 1)
        self.assertEqual(ExerciseTemplate.objects.count(), 1)
        self.assertEqual(SetTemplate.objects.count(), 2)
        self.assertEqual(template.name, "Push Day")

    def testUpdateTemplateWithExercises(self):
        template = WorkoutTemplate.create_with_exercises(
            user=self.user, template_data=self.template_data
        )

        update_data = {
            "name": "Updated Push Day",
            "notes": "Updated notes",
            "exercise_templates": [
                {
                    "name": "Incline Bench Press",
                    "rest_period": timedelta(seconds=90),
                    "increment_step": 2.5,
                    "set_templates": [
                        {"min_reps": 10, "max_reps": 12},
                    ],
                }
            ],
        }

        template.update_with_exercises(update_data)

        self.assertEqual(template.name, "Updated Push Day")
        self.assertEqual(ExerciseTemplate.objects.count(), 1)
        self.assertEqual(ExerciseTemplate.objects.first().name, "Incline Bench Press")
        self.assertEqual(SetTemplate.objects.count(), 1)
