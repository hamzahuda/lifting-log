from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
from django.db import transaction


# User Serializer
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


# --- Workout Serializers ---
class SetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = ["reps", "weight", "notes"]


class ExerciseSerializer(serializers.ModelSerializer):
    sets = SetSerializer(many=True)

    class Meta:
        model = Exercise
        fields = ["name", "rest_period", "min_reps", "max_reps", "notes", "sets"]


class WorkoutSerializer(serializers.HyperlinkedModelSerializer):

    user = serializers.ReadOnlyField(source="user.username")
    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = Workout
        fields = ("id", "url", "user", "name", "date", "notes", "exercises", "template")


# --- Template Serializers ---
class SetTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SetTemplate
        fields = ["id", "notes"]


class ExerciseTemplateSerializer(serializers.ModelSerializer):
    set_templates = SetTemplateSerializer(many=True)

    class Meta:
        model = ExerciseTemplate
        fields = [
            "id",
            "name",
            "rest_period",
            "min_reps",
            "max_reps",
            "notes",
            "set_templates",
        ]


class WorkoutTemplateSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    exercise_templates = ExerciseTemplateSerializer(many=True)

    class Meta:
        model = WorkoutTemplate
        fields = ["url", "id", "user", "name", "notes", "exercise_templates"]

    # This is so if any of the saves to db fail the everything gets rolled back
    @transaction.atomic
    def create(self, validated_data):

        # Remove the nested exercise templates data to allow workout template construction
        exercise_templates_data = validated_data.pop("exercise_templates")
        workout_template = WorkoutTemplate.objects.create(**validated_data)

        # For every exercise, remove and save the sets (nested data), create the exercise, then create all the sets
        for exercise_data in exercise_templates_data:
            set_templates_data = exercise_data.pop("set_templates")
            exercise_template = ExerciseTemplate.objects.create(
                workout_template=workout_template, **exercise_data
            )
            for set_data in set_templates_data:
                SetTemplate.objects.create(
                    exercise_template=exercise_template, **set_data
                )

        return workout_template
