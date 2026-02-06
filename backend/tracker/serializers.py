from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
import datetime
from django.utils import timezone


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


class CustomExerciseNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomExerciseName
        fields = ["id", "name"]

    def create(self, validated_data):
        user = self.context["request"].user
        return CustomExerciseName.objects.create(user=user, **validated_data)


class ExerciseGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseGoal
        fields = ["id", "exercise_name", "goal_weight", "created_at", "updated_at"]


# --- Workout Serializers ---
class SetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = ["id", "reps", "min_reps", "max_reps", "weight", "notes"]
        extra_kwargs = {
            "reps": {"required": False},
            "weight": {"required": False},
        }


class ExerciseSerializer(serializers.ModelSerializer):
    sets = SetSerializer(many=True)
    date = serializers.DateTimeField(source="workout.date", read_only=True)

    class Meta:
        model = Exercise
        fields = ["id", "name", "rest_period", "notes", "sets", "date"]


class WorkoutSerializer(serializers.HyperlinkedModelSerializer):

    user = serializers.ReadOnlyField(source="user.username")
    exercises = ExerciseSerializer(many=True, required=False)

    class Meta:
        model = Workout
        fields = ("id", "url", "user", "name", "date", "notes", "exercises", "template")
        extra_kwargs = {
            "name": {"required": False},
        }

    def create(self, validated_data):
        user = self.context["request"].user
        template = validated_data.get("template")
        date = validated_data.get("date", timezone.now())

        if template.user != user:
            raise serializers.ValidationError(
                "You do not have permission to use this template."
            )

        return Workout.create_from_template(user=user, template=template, date=date)

    def update(self, instance, validated_data):
        return instance.update_with_exercises(validated_data)


class WorkoutListSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Workout
        fields = ("id", "url", "user", "name", "date", "notes", "template")
        extra_kwargs = {
            "name": {"required": False},
        }


# --- Template Serializers ---
class SetTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SetTemplate
        fields = ["id", "min_reps", "max_reps", "notes"]


class ExerciseTemplateSerializer(serializers.ModelSerializer):
    set_templates = SetTemplateSerializer(many=True)

    class Meta:
        model = ExerciseTemplate
        fields = [
            "id",
            "name",
            "rest_period",
            "notes",
            "set_templates",
        ]


class WorkoutTemplateSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    exercise_templates = ExerciseTemplateSerializer(many=True)

    class Meta:
        model = WorkoutTemplate
        fields = ["url", "id", "user", "name", "notes", "exercise_templates"]

    def create(self, validated_data):
        user = self.context["request"].user
        return WorkoutTemplate.create_with_exercises(
            user=user, template_data=validated_data
        )

    def update(self, instance, validated_data):
        return instance.update_with_exercises(template_data=validated_data)
