from django.conf import settings
from django.db import models


class Workout(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateField()
    notes = models.TextField(blank=True)


class Exercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    rest_period = models.DurationField()
    min_reps = models.IntegerField()
    max_reps = models.IntegerField()
    notes = models.TextField(blank=True)

class Set(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    reps = models.FloatField()
    weight = models.FloatField()
    notes = models.TextField(blank=True)


class WorkoutTemplate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateField()
    notes = models.TextField(blank=True)

class ExerciseTemplate(models.Model):
    workout_template = models.ForeignKey(WorkoutTemplate, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    rest_period = models.DurationField()
    min_reps = models.IntegerField()
    max_reps = models.IntegerField()
    notes = models.TextField(blank=True)

class SetTemplate(models.Model):
    exercise_template = models.ForeignKey(ExerciseTemplate, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)