import { useEffect, useState } from "react";

function EditWorkoutForm({ originalWorkoutData, onSubmit }) {
    const initialData = originalWorkoutData;
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        // Deep copy of og workout data
        setFormData(JSON.parse(JSON.stringify(initialData)));
    }, [originalWorkoutData]);

    // Handlers for form state changes
    const handleAddExercise = () => {
        const newExercise = {
            id: `temp-${Date.now()}`,
            name: "",
            rest_period: "00:02:00",
            min_reps: 8,
            max_reps: 12,
            notes: "",
            sets: [{ id: `temp-set-${Date.now()}`, notes: "" }],
        };
        setFormData({
            ...formData,
            exercises: [...formData.exercises, newExercise],
        });
    };

    const handleExerciseChange = (index, event) => {
        const newExercises = [...formData.exercises];
        newExercises[index][event.target.name] = event.target.value;
        setFormData({ ...formData, exercises: newExercises });
    };

    const handleRemoveExercise = (index) => {
        const newExercises = [...formData.exercises];
        newExercises.splice(index, 1);
        setFormData({ ...formData, exercises: newExercises });
    };

    const handleAddSet = (exerciseIndex) => {
        const newExercises = [...formData.exercises];
        const newSet = { id: `temp-set-${Date.now()}`, notes: "" };
        newExercises[exerciseIndex].sets.push(newSet);
        setFormData({ ...formData, exercises: newExercises });
    };

    const handleSetChange = (exerciseIndex, setIndex, event) => {
        const newExercises = [...formData.exercises];
        newExercises[exerciseIndex].sets[setIndex][event.target.name] =
            event.target.value;
        setFormData({ ...formData, exercises: newExercises });
    };

    const handleRemoveSet = (exerciseIndex, setIndex) => {
        const newExercises = [...formData.exercises];
        newExercises[exerciseIndex].sets.splice(setIndex, 1);
        setFormData({ ...formData, exercises: newExercises });
    };

    if (!formData) {
        return <div>Loading form...</div>;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>"Edit Workout"</h2>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Workout Name (e.g., Upper Body)"
                required
            />
            <textarea
                name="notes"
                value={formData.notes}
                onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Workout Notes (e.g., Focus on strength)"
            />

            <h3>Exercises</h3>
            {formData.exercises.map((exercise, exerciseIndex) => (
                <div key={exercise.id}>
                    <h4>Exercise {exerciseIndex + 1}</h4>
                    <input
                        type="text"
                        name="name"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(exerciseIndex, e)}
                        placeholder="Exercise Name (e.g., Bench Press)"
                        required
                    />
                    <input
                        type="text"
                        name="rest_period"
                        value={exercise.rest_period}
                        onChange={(e) => handleExerciseChange(exerciseIndex, e)}
                        placeholder="Rest Period (HH:MM:SS)"
                        required
                    />
                    <div>
                        <input
                            type="number"
                            name="min_reps"
                            value={exercise.min_reps}
                            onChange={(e) =>
                                handleExerciseChange(exerciseIndex, e)
                            }
                            placeholder="Min Reps"
                            required
                        />
                        <input
                            type="number"
                            name="max_reps"
                            value={exercise.max_reps}
                            onChange={(e) =>
                                handleExerciseChange(exerciseIndex, e)
                            }
                            placeholder="Max Reps"
                            required
                        />
                    </div>
                    <textarea
                        name="notes"
                        value={exercise.notes}
                        onChange={(e) => handleExerciseChange(exerciseIndex, e)}
                        placeholder="Exercise Notes"
                    />

                    {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex}>
                            <label>Set {setIndex + 1}</label>
                            <input
                                type="text"
                                name="notes"
                                value={set.notes}
                                onChange={(e) =>
                                    handleSetChange(exerciseIndex, setIndex, e)
                                }
                                placeholder="Set Notes (e.g., Warm-up set)"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    handleRemoveSet(exerciseIndex, setIndex)
                                }
                            >
                                Remove Set
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleAddSet(exerciseIndex)}
                    >
                        Add Set
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRemoveExercise(exerciseIndex)}
                    >
                        Remove Exercise
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAddExercise}>
                Add Exercise
            </button>
            <br />
            <button type="submit">Save Changes</button>
        </form>
    );
}

export default EditWorkoutForm;
