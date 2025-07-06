from rest_framework import serializers
from .models import Workout
from django.contrib.auth.models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["url", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}


class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ("id", "user", "name", "date", "notes")
