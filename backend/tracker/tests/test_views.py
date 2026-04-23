from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.utils.dateparse import parse_datetime
from tracker.models import (
    Workout,
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
