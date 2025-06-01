from django.conf import settings
from django.db import models


class Workout(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateField()
    notes = models.TextField()


class Exercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    rest_period = models.TimeField()
    min_reps = models.IntegerField()
    max_reps = models.IntegerField()
    notes = models.TextField()

class Set(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    reps = models.FloatField()
    weight = models.FloatField()
    notes = models.TextField()
