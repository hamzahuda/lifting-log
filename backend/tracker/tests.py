from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock
from .models import *
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from django.urls import reverse
from django.utils.dateparse import parse_datetime

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

    def testDuplicateTemplate(self):
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
        self.assertEqual(
            duplicate.exercise_templates.first().set_templates.count(),
            template.exercise_templates.first().set_templates.count(),
        )

    def testDuplicateInvalidTemplate(self):
        duplicate = WorkoutTemplate.duplicate_from_id(
            user=self.user, template_to_duplicate_id=999
        )

        self.assertIsNone(duplicate)


class WorkoutTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )
        self.client.force_authenticate(user=self.user)

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

    def testCreateWorkoutFromTemplate(self):
        workout = Workout.create_from_template(
            user=self.user, template=self.template, date=timezone.now()
        )

        self.assertEqual(Workout.objects.count(), 1)
        self.assertEqual(workout.name, self.template.name)
        self.assertEqual(
            workout.exercises.count(), self.template.exercise_templates.count()
        )
        self.assertEqual(
            workout.exercises.first().sets.count(),
            self.template.exercise_templates.first().set_templates.count(),
        )

        # Should have None weights/reps since no previous workout exists to progressively overload from
        first_set = workout.exercises.first().sets.first()
        self.assertIsNone(first_set.weight)
        self.assertIsNone(first_set.reps)

    def testWorkoutAutofillProgressiveOverload(self):
        # Create a previous workout where the top of the rep range was hit
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

        # Check if auto-filled and progressively overloaded
        new_exercise = new_workout.exercises.first()
        for s in new_exercise.sets.all():
            self.assertEqual(
                s.weight, 100 + self.template.exercise_templates.first().increment_step
            )

    def testWorkoutAutofillMaintainWeight(self):
        # Create a previous workout where max reps were not hit
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

    def testUpdateWorkoutWithExercises(self):
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
        self.assertEqual(workout.notes, update_data["notes"])

        updated_set = workout.exercises.first().sets.first()
        self.assertEqual(updated_set.reps, 6)
        self.assertEqual(updated_set.weight, 110)


class ProgressAndHistoryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )
        self.client.force_authenticate(user=self.user)

        # Workout 1
        date1 = timezone.now() - timedelta(days=14)
        w1 = Workout.objects.create(user=self.user, name="Back", date=date1)
        e1 = Exercise.objects.create(
            workout=w1, name="Deadlift", rest_period=timedelta(seconds=120)
        )
        Set.objects.create(exercise=e1, reps=5, min_reps=5, max_reps=5, weight=140)

        # Workout 2
        date2 = timezone.now() - timedelta(days=7)
        w2 = Workout.objects.create(user=self.user, name="Back", date=date2)
        e2 = Exercise.objects.create(
            workout=w2, name="Deadlift", rest_period=timedelta(seconds=120)
        )
        Set.objects.create(exercise=e2, reps=5, min_reps=5, max_reps=5, weight=145)

        # Current Workout (in progress)
        self.current_date = timezone.now()
        self.current_workout = Workout.objects.create(
            user=self.user, name="Back", date=self.current_date
        )

    def testGettingLastPerformance(self):
        url = reverse("exercise-last-performance")
        response = self.client.get(
            url, {"name": "Deadlift", "workout_id": self.current_workout.id}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            parse_datetime(response.data["date"]),
            Workout.objects.get(id=2).date,
        )
        self.assertEqual(response.data["sets"][0]["weight"], 145)

    def testGettingLastPerformanceMissingParams(self):
        url = reverse("exercise-last-performance")

        # Missing workout_id
        response = self.client.get(url, {"name": "Deadlift"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
