from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"users", views.UserViewSet, basename="user")
router.register(r"workouts", views.WorkoutViewSet, basename="workout")
router.register(
    r"workout-templates", views.WorkoutTemplateViewSet, basename="workouttemplate"
)
router.register(
    r"custom-exercise-names",
    views.CustomExerciseNameViewSet,
    basename="customexercisename",
)

urlpatterns = [
    path("", include(router.urls)),
]
