from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from unittest.mock import patch, MagicMock
from datetime import timedelta
from django.utils import timezone
from tracker.models import (
    User,
    WorkoutTemplate,
    ExerciseTemplate,
    SetTemplate,
    Workout,
    Exercise,
    Set,
)

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
    def test_delete_user_supabase_sync(self, mock_create_client):
        mock_supabase = MagicMock()
        mock_create_client.return_value = mock_supabase
        self.user.delete()
        self.assertFalse(User.objects.filter(username="testuser").exists())
        mock_create_client.assert_called_once()
        mock_supabase.auth.admin.delete_user.assert_called_once_with("mock-uuid-1234")

    @patch("tracker.models.create_client")
    def test_delete_user_no_supabase_id(self, mock_create_client):
        user_no_sb = User.objects.create_user(
            username="testuser2", password="testpassword2"
        )
        user_no_sb.delete()
        self.assertFalse(User.objects.filter(username="testuser2").exists())
        mock_create_client.assert_not_called()


class WorkoutTemplateModelTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser")
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

    def test_create_template_with_exercises(self):
        template = WorkoutTemplate.create_with_exercises(
            user=self.user, template_data=self.template_data
        )
        self.assertEqual(WorkoutTemplate.objects.count(), 1)
        self.assertEqual(ExerciseTemplate.objects.count(), 1)
        self.assertEqual(SetTemplate.objects.count(), 2)
        self.assertEqual(template.name, "Push Day")

    def test_update_template_with_exercises(self):
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

    def test_duplicate_template(self):
        template = WorkoutTemplate.create_with_exercises(
            user=self.user, template_data=self.template_data
        )
        duplicate = WorkoutTemplate.duplicate_from_id(
            user=self.user, template_to_duplicate_id=template.id
        )
        self.assertIsNotNone(duplicate)
        self.assertEqual(WorkoutTemplate.objects.count(), 2)
        self.assertEqual(duplicate.name, f"{template.name} (Copy)")
        self.assertEqual(
            duplicate.exercise_templates.count(), template.exercise_templates.count()
        )

    def test_duplicate_invalid_template(self):
        duplicate = WorkoutTemplate.duplicate_from_id(
            user=self.user, template_to_duplicate_id=999
        )
        self.assertIsNone(duplicate)


class WorkoutModelTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )
        template_data = {
            "name": "Leg Day",
            "notes": "",
            "exercise_templates": [
                {
                    "name": "Squat",
                    "rest_period": timedelta(seconds=180),
                    "increment_step": 5.0,
                    "set_templates": [
                        {"min_reps": 4, "max_reps": 6, "notes": ""},
                        {"min_reps": 4, "max_reps": 6, "notes": ""},
                    ],
                }
            ],
        }
        self.template = WorkoutTemplate.create_with_exercises(
            user=self.user, template_data=template_data
        )

    def test_create_workout_from_template(self):
        workout = Workout.create_from_template(
            user=self.user, template=self.template, date=timezone.now()
        )
        self.assertEqual(Workout.objects.count(), 1)
        self.assertEqual(workout.name, self.template.name)
        self.assertEqual(
            workout.exercises.count(), self.template.exercise_templates.count()
        )
        first_set = workout.exercises.first().sets.first()
        self.assertIsNone(first_set.weight)
        self.assertIsNone(first_set.reps)

    def test_workout_autofill_progressive_overload(self):
        prev_workout = Workout.objects.create(
            user=self.user, name="Leg Day", date=timezone.now() - timedelta(days=7)
        )
        prev_exercise = Exercise.objects.create(
            workout=prev_workout, name="Squat", rest_period=timedelta(seconds=180)
        )
        Set.objects.create(
            exercise=prev_exercise, reps=6, min_reps=4, max_reps=6, weight=100
        )
        Set.objects.create(
            exercise=prev_exercise, reps=6, min_reps=4, max_reps=6, weight=100
        )

        new_workout = Workout.create_from_template(
            user=self.user, template=self.template, date=timezone.now()
        )
        new_exercise = new_workout.exercises.first()
        for s in new_exercise.sets.all():
            self.assertEqual(
                s.weight, 100 + self.template.exercise_templates.first().increment_step
            )

    def test_workout_autofill_maintain_weight(self):
        prev_workout = Workout.objects.create(
            user=self.user, name="Leg Day", date=timezone.now() - timedelta(days=7)
        )
        prev_exercise = Exercise.objects.create(
            workout=prev_workout, name="Squat", rest_period=timedelta(seconds=180)
        )
        Set.objects.create(
            exercise=prev_exercise, reps=6, min_reps=4, max_reps=6, weight=100
        )
        Set.objects.create(
            exercise=prev_exercise, reps=5, min_reps=4, max_reps=6, weight=100
        )

        new_workout = Workout.create_from_template(
            user=self.user, template=self.template, date=timezone.now()
        )
        new_exercise = new_workout.exercises.first()
        for s in new_exercise.sets.all():
            self.assertEqual(s.weight, 100)

    def test_update_workout_with_exercises(self):
        workout = Workout.create_from_template(
            user=self.user, template=self.template, date=timezone.now()
        )
        update_data = {
            "name": "Leg Day Completed",
            "date": timezone.now(),
            "notes": "Felt strong today",
            "exercises": [
                {
                    "name": "Squat",
                    "rest_period": timedelta(seconds=180),
                    "sets": [
                        {"min_reps": 4, "max_reps": 6, "reps": 6, "weight": 110},
                        {"min_reps": 4, "max_reps": 6, "reps": 5, "weight": 110},
                    ],
                }
            ],
        }
        workout.update_with_exercises(update_data)
        self.assertEqual(workout.name, update_data["name"])
        updated_set = workout.exercises.first().sets.first()
        self.assertEqual(updated_set.reps, 6)
        self.assertEqual(updated_set.weight, 110)
