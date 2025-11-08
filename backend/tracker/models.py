from django.conf import settings
from django.db import models, transaction
from django.contrib.auth.models import AbstractUser
from supabase import create_client
from django.forms.models import model_to_dict
import logging

logger = logging.getLogger(__name__)


class User(AbstractUser):
    supabase_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    email = models.EmailField(("email address"), unique=True, null=True, blank=True)

    def delete(self, *args, **kwargs):
        """
        Overrides the default delete method to also delete the user from Supabase.
        """
        if self.supabase_id:
            try:
                supabaseAdmin = create_client(
                    settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY
                )

                supabaseAdmin.auth.admin.delete_user(self.supabase_id)

                logger.info(
                    f"Successfully deleted user {self.supabase_id} from Supabase."
                )
            except Exception as e:
                logger.error(
                    f"Failed to delete user {self.supabase_id} from Supabase: {e}"
                )

        super().delete(*args, **kwargs)


class CustomExerciseName(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user", "name"]


# --- Workout Models ---


class Workout(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateTimeField()
    notes = models.TextField(blank=True)
    template = models.ForeignKey(
        "WorkoutTemplate", on_delete=models.SET_NULL, null=True, blank=True
    )

    @classmethod
    @transaction.atomic
    def create_from_template(cls, user, template, date):
        new_workout = cls.objects.create(
            user=user,
            name=template.name,
            notes=template.notes,
            date=date,
            template=template,
        )

        # Copy exercises and sets from the template
        for exercise_template in template.exercise_templates.all():
            new_exercise = new_workout.exercises.create(
                name=exercise_template.name,
                rest_period=exercise_template.rest_period,
                notes=exercise_template.notes,
            )
            for set_template in exercise_template.set_templates.all():
                new_exercise.sets.create(
                    notes=set_template.notes,
                    min_reps=set_template.min_reps,
                    max_reps=set_template.max_reps,
                )
        return new_workout

    @transaction.atomic
    def update_with_exercises(self, workout_data):
        self.name = workout_data.get("name", self.name)
        self.date = workout_data.get("date", self.date)
        self.notes = workout_data.get("notes", self.notes)
        self.save()

        if "exercises" in workout_data:
            self.exercises.all().delete()
            exercises_data = workout_data.get("exercises")
            for exercise_data in exercises_data:
                sets_data = exercise_data.pop("sets")
                exercise = self.exercises.create(**exercise_data)
                for set_data in sets_data:
                    set_data.setdefault("reps", 0)
                    set_data.setdefault("weight", 0)
                    exercise.sets.create(**set_data)
        return self

    def __str__(self):
        return f"{self.name} on {self.date}"


class Exercise(models.Model):
    workout = models.ForeignKey(
        "Workout", related_name="exercises", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    rest_period = models.DurationField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Set(models.Model):
    exercise = models.ForeignKey(
        "Exercise", related_name="sets", on_delete=models.CASCADE
    )
    reps = models.FloatField(blank=True, null=True)
    min_reps = models.IntegerField()
    max_reps = models.IntegerField()
    weight = models.FloatField(blank=True, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name


# --- Template Models ---


class WorkoutTemplate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    notes = models.TextField(blank=True)

    @classmethod
    @transaction.atomic
    def create_with_exercises(cls, user, template_data):
        exercise_data = template_data.pop("exercise_templates")
        template = cls.objects.create(user=user, **template_data)
        for exercise_template_data in exercise_data:
            set_data = exercise_template_data.pop("set_templates")
            exercise = template.exercise_templates.create(**exercise_template_data)
            for set_template_data in set_data:
                exercise.set_templates.create(**set_template_data)
        return template

    @transaction.atomic
    def update_with_exercises(self, template_data):
        self.name = template_data.get("name", self.name)
        self.notes = template_data.get("notes", self.notes)
        self.save()

        if "exercise_templates" in template_data:
            self.exercise_templates.all().delete()
            exercise_data = template_data.get("exercise_templates", [])
            for exercise_template_data in exercise_data:
                set_data = exercise_template_data.pop("set_templates")
                exercise = self.exercise_templates.create(**exercise_template_data)
                for set_template_data in set_data:
                    exercise.set_templates.create(**set_template_data)
        return self

    @classmethod
    @transaction.atomic
    def duplicate_from_id(cls, user, template_to_duplicate_id):
        try:
            template_to_duplicate = cls.objects.get(id=template_to_duplicate_id)
        except cls.DoesNotExist:
            return None

        template_data = {
            "name": f"{template_to_duplicate.name} (Copy)",
            "notes": template_to_duplicate.notes,
            "exercise_templates": [],
        }

        for ex in template_to_duplicate.exercise_templates.all():
            exercise_dict = model_to_dict(ex, exclude=["id", "workout_template"])
            exercise_dict["set_templates"] = []

            for s in ex.set_templates.all():
                set_dict = model_to_dict(s, exclude=["id", "exercise_template"])
                exercise_dict["set_templates"].append(set_dict)

            template_data["exercise_templates"].append(exercise_dict)

        new_template = cls.create_with_exercises(user=user, template_data=template_data)

        return new_template

    def __str__(self):
        return f"{self.name} - Template"


class ExerciseTemplate(models.Model):
    workout_template = models.ForeignKey(
        WorkoutTemplate, related_name="exercise_templates", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    rest_period = models.DurationField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - Template"


class SetTemplate(models.Model):
    exercise_template = models.ForeignKey(
        ExerciseTemplate, related_name="set_templates", on_delete=models.CASCADE
    )
    min_reps = models.IntegerField()
    max_reps = models.IntegerField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - Template"
