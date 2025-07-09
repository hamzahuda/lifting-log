from .models import *
from rest_framework import viewsets, generics
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .permissions import *
from .serializers import *


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.is_staff:
                return User.objects.all()
            return User.objects.filter(pk=user.pk)
        return User.objects.none()

    def get_permissions(self):
        if self.action == "create":
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAccountOwnerOrAdmin]
        return [permission() for permission in permission_classes]


class WorkoutViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated, IsObjectOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Workout.objects.all()
        return Workout.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
