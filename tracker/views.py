from django.shortcuts import render
from .models import *
from rest_framework import viewsets
from .serializers import *

# Create your views here.

class WorkoutView(viewsets.ModelViewSet):
    serializer_class = WorkoutSerializer
    queryset = Workout.objects.all()