from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Workout,
    Exercise,
    Set,
    WorkoutTemplate,
    ExerciseTemplate,
    SetTemplate,
    User,
)


class WorkoutAdmin(
    admin.ModelAdmin
):  # makes it in the admin interface show the data wihtout having to click the entry
    list_display = ("name", "date", "notes")


# Register your models here.
admin.site.register(Workout, WorkoutAdmin)
admin.site.register(Exercise)
admin.site.register(Set)
admin.site.register(WorkoutTemplate)
admin.site.register(ExerciseTemplate)
admin.site.register(SetTemplate)
admin.site.register(User, UserAdmin)
