from .models import *
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import *


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class WorkoutListCreate(generics.ListCreateAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Workout.objects.filter(user=user)


class WorkoutDelete(generics.DestroyAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Workout.objects.filter(author=user)
