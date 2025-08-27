from .models import *
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import *
from .serializers import *
import datetime


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
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


class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated, IsObjectOwner]

    def get_queryset(self):
        user = self.request.user
        return Workout.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        template_id = request.data.get("template")
        if not template_id:
            return Response(
                {"error": "A 'template' ID is required to create a workout."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            template = WorkoutTemplate.objects.get(pk=template_id, user=request.user)
        except WorkoutTemplate.DoesNotExist:
            return Response(
                {"error": "Workout template not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        date = request.data.get("date", datetime.date.today())
        new_workout = Workout.create_from_template(
            user=request.user, template=template, date=date
        )

        serializer = self.get_serializer(new_workout)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def update(self, request, *args, **kwargs):
        workout_instance = self.get_object()

        updated_workout = workout_instance.update_with_exercises(request.data)

        serializer = self.get_serializer(updated_workout)
        return Response(serializer.data)
