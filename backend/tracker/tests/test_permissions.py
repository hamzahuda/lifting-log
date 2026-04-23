from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from tracker.models import Workout, WorkoutTemplate

User = get_user_model()


class PermissionsTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1", password="password123", email="user1@user1.com"
        )
        self.user2 = User.objects.create_user(
            username="user2", password="password123", email="user2@user2.com"
        )
        self.workout_user1 = Workout.objects.create(
            user=self.user1, name="User 1 Workout", date=timezone.now()
        )
        self.template_user1 = WorkoutTemplate.objects.create(
            user=self.user1, name="User 1 Template"
        )

    def test_unauthenticated_user(self):
        response = self.client.get(reverse("workout-list"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_object_owner_permission(self):
        self.client.force_authenticate(user=self.user2)

        # Try to retrieve user1's workout
        response = self.client.get(
            reverse("workout-detail", args=[self.workout_user1.id])
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Try to modify user1's template
        response = self.client.patch(
            reverse("workouttemplate-detail", args=[self.template_user1.id]),
            {"name": "Hacked"},
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Ensure user2's list is empty
        response = self.client.get(reverse("workout-list"))
        self.assertEqual(len(response.data), 0)
