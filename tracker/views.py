from .models import *
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import *
from .serializers import *
import datetime
from django.db import transaction


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

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        template_id = request.data.get("template")

        if not template_id:
            return Response(
                {"error": "Template required to create a workout."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            template = WorkoutTemplate.objects.get(pk=template_id, user=request.user)
        except WorkoutTemplate.DoesNotExist:
            return Response(
                {"error": "Workout template not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create the new Workout from the template
        new_workout = Workout.objects.create(
            user=request.user,
            name=template.name,
            notes=template.notes,
            date=request.data.get("date", datetime.date.today()),
            template=template,
        )

        # Copy exercises and sets from the template
        for exercise_template in template.exercise_templates.all():
            new_exercise = Exercise.objects.create(
                workout=new_workout,
                name=exercise_template.name,
                rest_period=exercise_template.rest_period,
                min_reps=exercise_template.min_reps,
                max_reps=exercise_template.max_reps,
                notes=exercise_template.notes,
            )
            for set_template in exercise_template.set_templates.all():
                Set.objects.create(
                    exercise=new_exercise,
                    reps=0,
                    weight=0,
                    notes=set_template.notes,
                )

        serializer = self.get_serializer(new_workout)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
