from django.conf import settings
from django.db import models, transaction

# --- Workout Models ---


class Workout(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateField()
    notes = models.TextField(blank=True)
    template = models.ForeignKey(
        "WorkoutTemplate", on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return f"{self.name} on {self.date}"


class Exercise(models.Model):
    workout = models.ForeignKey(
        "Workout", related_name="exercises", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    rest_period = models.DurationField()
    min_reps = models.IntegerField()
    max_reps = models.IntegerField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Set(models.Model):
    exercise = models.ForeignKey(
        "Exercise", related_name="sets", on_delete=models.CASCADE
    )
    reps = models.FloatField()
    weight = models.FloatField()
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

        self.exercise_templates.all().delete()  # Delete old exercises
        exercise_data = template_data.get("exercise_templates", [])
        for exercise_template_data in exercise_data:
            set_data = exercise_template_data.pop("set_templates")
            exercise = self.exercise_templates.create(**exercise_template_data)
            for set_template_data in set_data:
                exercise.set_templates.create(**set_template_data)
        return self

    def __str__(self):
        return f"{self.name} - Template"


class ExerciseTemplate(models.Model):
    workout_template = models.ForeignKey(
        WorkoutTemplate, related_name="exercise_templates", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    rest_period = models.DurationField()
    min_reps = models.IntegerField()
    max_reps = models.IntegerField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - Template"


class SetTemplate(models.Model):
    exercise_template = models.ForeignKey(
        ExerciseTemplate, related_name="set_templates", on_delete=models.CASCADE
    )
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - Template"
