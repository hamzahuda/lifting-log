import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../api";
import EditWorkoutForm from "../components/EditWorkoutForm";

function WorkoutDetail() {
    const { id } = useParams();
    const [workout, setWorkout] = useState(null);

    const [isEditing, setIsEditing] = useState(false);

    let navigate = useNavigate();

    const getWorkout = () => {
        api.get(`/workouts/${id}/`)
            .then((res) => {
                setWorkout(res.data);
            })
            .catch((err) => alert(err));
    };

    useEffect(() => {
        getWorkout();
    }, [id]);

    if (!workout) {
        return <div>Loading workout...</div>;
    }

    const handleSave = () => {
        setIsEditing(false);
        getWorkout();
    };

    const handleEditSubmit = (workoutData) => {
        api.put(`/workouts/${workout.id}/`, workoutData)
            .then((res) => {
                if (res.status === 200) {
                    alert("Workout updated successfully!");
                    handleSave();
                    getWorkout();
                } else {
                    alert("Failed to update workout.");
                }
            })
            .catch((err) => alert(err));
    };

    const handleDeleteWorkout = () => {
        if (window.confirm("Are you sure you want to delete this workout?")) {
            api.delete(`/workouts/${id}/`)
                .then(() => {
                    alert("Workout deleted successfully!");
                    navigate("/");
                })
                .catch((err) => alert(err));
        }
    };

    return (
        <div>
            {isEditing ? (
                <EditWorkoutForm
                    originalWorkoutData={workout}
                    onSubmit={handleEditSubmit}
                />
            ) : (
                <>
                    <h1>Workout Name: {workout.name}</h1>
                    <p>Workout Notes: {workout.notes}</p>
                    {workout.exercises.map((exercise) => (
                        <div key={exercise.id}>
                            <p>--</p>
                            <p>{exercise.name}</p>
                            <p>
                                {exercise.min_reps} - {exercise.max_reps} reps
                            </p>
                            <p>{exercise.rest_period} rest</p>
                            <p>Notes: {exercise.notes}</p>

                            {exercise.sets.map((set, index) => (
                                <p key={set.id}>
                                    Set {index + 1}{" "}
                                    {set.notes ? `(${set.notes})` : ""}
                                </p>
                            ))}
                        </div>
                    ))}
                </>
            )}
            <button type="button" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel Edit" : "Edit Workout"}
            </button>

            {!isEditing && (
                <button type="button" onClick={handleDeleteWorkout}>
                    Delete Workout
                </button>
            )}
        </div>
    );
}

export default WorkoutDetail;
