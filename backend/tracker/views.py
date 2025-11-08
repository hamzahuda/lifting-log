from .models import *
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .permissions import *
from .serializers import *


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    lookup_field = "supabase_id"

    def get_queryset(self):
        user = self.request.user
        User = get_user_model()
        if user.is_authenticated:
            return User.objects.filter(pk=user.pk)
        return User.objects.none()

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAccountOwner]
        return [permission() for permission in permission_classes]


class WorkoutTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutTemplateSerializer
    permission_classes = [IsAuthenticated, IsObjectOwner]

    def get_queryset(self):
        user = self.request.user
        return WorkoutTemplate.objects.filter(user=user)

    @action(detail=True, methods=["post"], url_path="duplicate")
    def duplicate(self, request, pk=None):

        new_template = WorkoutTemplate.duplicate_from_id(
            user=request.user, template_to_duplicate_id=pk
        )

        if new_template:
            serializer = WorkoutTemplateSerializer(new_template)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {"error": "Template not found"}, status=status.HTTP_404_NOT_FOUND
            )


class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated, IsObjectOwner]

    def get_queryset(self):
        user = self.request.user
        return Workout.objects.filter(user=user).order_by("-date")

    def get_serializer_class(self):
        if self.action == "list":
            return WorkoutListSerializer
        return self.serializer_class


class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated, IsObjectOwner]

    def get_queryset(self):
        user = self.request.user
        return Exercise.objects.filter(workout__user=user)

    @action(detail=False, methods=["get"], url_path="last-performance")
    def last_performance(self, request):
        exercise_name = request.query_params.get("name")
        current_workout_id = request.query_params.get("workout_id")

        if not exercise_name or not current_workout_id:
            return Response(
                {"error": "Missing 'name' or 'workout_id' query parameters"}, status=400
            )

        try:
            # Get the workout currently being viewed
            current_workout = Workout.objects.get(
                id=current_workout_id, user=request.user
            )
        except Workout.DoesNotExist:
            return Response({"error": "Workout not found"}, status=404)

        last_exercise = (
            Exercise.objects.filter(
                workout__user=request.user,
                name=exercise_name,
                workout__date__lt=current_workout.date,
            )
            .order_by("-workout__date")
            .first()
        )

        if last_exercise:
            serializer = self.get_serializer(last_exercise)
            return Response(serializer.data)
        else:
            return Response(None)


class CustomExerciseNameViewSet(viewsets.ModelViewSet):
    serializer_class = CustomExerciseNameSerializer
    permission_classes = [IsAuthenticated, IsObjectOwner]

    def get_queryset(self):
        user = self.request.user
        return CustomExerciseName.objects.filter(user=user)
