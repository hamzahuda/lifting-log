from rest_framework import serializers
from .models import Workout
from django.contrib.auth.models import User


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["url", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"], password=validated_data["password"]
        )
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get("username", instance.username)

        password = validated_data.get("password", None)
        if password:
            instance.set_password(password)

        instance.save()
        return instance


class WorkoutSerializer(serializers.HyperlinkedModelSerializer):

    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Workout
        fields = ("id", "user", "name", "date", "notes")
