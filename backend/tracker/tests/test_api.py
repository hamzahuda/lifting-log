from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.utils.dateparse import parse_datetime
from tracker.models import (
    Workout,
    WorkoutTemplate,
    Exercise,
    Set,
    ExerciseGoal,
    CustomExerciseName,
)

User = get_user_model()


class ProgressAndHistoryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )
        self.client.force_authenticate(user=self.user)

        date1 = timezone.now() - timedelta(days=14)
        self.w1 = Workout.objects.create(user=self.user, name="Back", date=date1)
        e1 = Exercise.objects.create(
            workout=self.w1, name="Deadlift", rest_period=timedelta(seconds=120)
        )
        Set.objects.create(exercise=e1, reps=5, min_reps=5, max_reps=5, weight=140)

        date2 = timezone.now() - timedelta(days=7)
        self.w2 = Workout.objects.create(user=self.user, name="Back", date=date2)
        e2 = Exercise.objects.create(
            workout=self.w2, name="Deadlift", rest_period=timedelta(seconds=120)
        )
        Set.objects.create(exercise=e2, reps=5, min_reps=5, max_reps=5, weight=145)

        self.current_date = timezone.now()
        self.current_workout = Workout.objects.create(
            user=self.user, name="Back", date=self.current_date
        )

    def test_getting_last_performance(self):
        url = reverse("exercise-last-performance")
        response = self.client.get(
            url, {"name": "Deadlift", "workout_id": self.current_workout.id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(parse_datetime(response.data["date"]), self.w2.date)
        self.assertEqual(response.data["sets"][0]["weight"], 145)

    def test_getting_last_performance_missing_params(self):
        url = reverse("exercise-last-performance")
        response = self.client.get(url, {"name": "Deadlift"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_exercise_directory_search(self):
        w3 = Workout.objects.create(
            user=self.user, name="Chest", date=self.current_date - timedelta(days=1)
        )
        Exercise.objects.create(
            workout=w3, name="Dumbbell Press", rest_period=timedelta(seconds=60)
        )
        url = reverse("exercise-directory")

        response_all = self.client.get(url)
        self.assertEqual(response_all.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_all.data), 2)

        response_search = self.client.get(url, {"search": "Dumbbell"})
        self.assertEqual(response_search.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_search.data), 1)
        self.assertEqual(response_search.data[0], "Dumbbell Press")

    def test_single_exercise_history(self):
        e_null = Exercise.objects.create(
            workout=self.current_workout,
            name="Deadlift",
            rest_period=timedelta(seconds=120),
        )
        Set.objects.create(
            exercise=e_null, reps=None, min_reps=5, max_reps=5, weight=None
        )

        url = reverse("exercise-single-exercise-history")
        response = self.client.get(url, {"exercise_name": "Deadlift"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["sets"][0]["weight"], 140)
        self.assertEqual(response.data[1]["sets"][0]["weight"], 145)


class SettingsAndGoalsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )
        self.client.force_authenticate(user=self.user)

    def test_create_exercise_goal(self):
        url = reverse("exercisegoal-list")
        data = {"exercise_name": "Bench Press", "goal_weight": 100.0}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ExerciseGoal.objects.count(), 1)
        self.assertEqual(ExerciseGoal.objects.first().goal_weight, 100.0)

    def test_create_custom_exercise_name(self):
        url = reverse("customexercisename-list")
        data = {"name": "Zercher Squat"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomExerciseName.objects.count(), 1)
        self.assertEqual(CustomExerciseName.objects.first().name, "Zercher Squat")


class WorkoutTemplateViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword", email="user@user.com"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpassword", email="other@other.com"
        )
        self.client.force_authenticate(user=self.user)

        self.template = WorkoutTemplate.create_with_exercises(
            user=self.user,
            template_data={"name": "My Template", "exercise_templates": []},
        )

    def test_list_templates(self):
        url = reverse("workouttemplate-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "My Template")

    def test_create_template(self):
        url = reverse("workouttemplate-list")
        data = {"name": "New Template", "notes": "Testing", "exercise_templates": []}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkoutTemplate.objects.filter(user=self.user).count(), 2)

    def test_cannot_see_other_users_templates(self):
        WorkoutTemplate.create_with_exercises(
            user=self.other_user,
            template_data={"name": "Other Template", "exercise_templates": []},
        )
        url = reverse("workouttemplate-list")
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)


class WorkoutViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword", email="user@user.com"
        )
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpassword", email="other@other.com"
        )
        self.client.force_authenticate(user=self.user)

        self.template = WorkoutTemplate.create_with_exercises(
            user=self.user,
            template_data={"name": "My Template", "exercise_templates": []},
        )
        self.other_user_template = WorkoutTemplate.create_with_exercises(
            user=self.other_user,
            template_data={"name": "Other Template", "exercise_templates": []},
        )

    def test_create_workout_from_template(self):
        url = reverse("workout-list")
        data = {
            "template": reverse("workouttemplate-detail", args=[self.template.id]),
            "date": timezone.now().date(),
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workout.objects.count(), 1)
        self.assertEqual(Workout.objects.first().name, "My Template")

    def test_create_workout_from_other_users_template(self):
        url = reverse("workout-list")
        data = {
            "template": reverse(
                "workouttemplate-detail", args=[self.other_user_template.id]
            ),
            "date": timezone.now().date(),
        }
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "You do not have permission to use this template.", str(response.data)
        )

    def test_list_workouts_uses_list_serializer(self):
        Workout.objects.create(
            user=self.user, name="Quick Session", date=timezone.now()
        )
        url = reverse("workout-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Make sure exercises are not included
        self.assertNotIn("exercises", response.data[0])


class UserViewSetTests(APITestCase):
    def test_user_list_requires_auth(self):
        url = reverse("user-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
