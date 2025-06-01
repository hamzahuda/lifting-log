from django.contrib import admin
from .models import Workout, Exercise, Set, WorkoutTemplate, ExerciseTemplate, SetTemplate

# Register your models here.
admin.site.register(Workout)
admin.site.register(Exercise)
admin.site.register(Set)
admin.site.register(WorkoutTemplate)
admin.site.register(ExerciseTemplate)
admin.site.register(SetTemplate)