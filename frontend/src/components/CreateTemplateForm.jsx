import { useState } from "react";
import api from "../api";

function CreateTemplateForm({ onTemplateCreated }) {
    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [exercises, setExercises] = useState([]);

    // Exercise handlers
    const handleAddExercise = () => {
        setExercises([
            ...exercises,
            {
                name: "",
                rest_period: "00:02:00",
                min_reps: 8,
                max_reps: 12,
                notes: "",
                set_templates: [{ notes: "" }, { notes: "" }, { notes: "" }],
            },
        ]);
    };

    const handleExerciseChange = (index, event) => {
        const newExercises = [...exercises];
        newExercises[index][event.target.name] = event.target.value;
        setExercises(newExercises);
    };

    const handleRemoveExercise = (index) => {
        const newExercises = [...exercises];
        newExercises.splice(index, 1);
        setExercises(newExercises);
    };

    // Set handlers
    const handleAddSet = (exerciseIndex) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].set_templates.push({ notes: "" });
        setExercises(newExercises);
    };

    const handleSetChange = (exerciseIndex, setIndex, event) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].set_templates[setIndex][event.target.name] =
            event.target.value;
        setExercises(newExercises);
    };

    const handleRemoveSet = (exerciseIndex, setIndex) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].set_templates.splice(setIndex, 1);
        setExercises(newExercises);
    };

    // Form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        const templateData = {
            name,
            notes,
            exercise_templates: exercises,
        };

        try {
            await api.post("/workout-templates/", templateData);
            alert("Template created successfully!");

            // Reset form after successful submission
            setName("");
            setNotes("");
            setExercises([]);

            // Refresh template list
            onTemplateCreated();
        } catch (error) {
            alert("Failed to create template: " + error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create New Template</h2>
            <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template Name (e.g., Upper Body)"
                required
            />
            <textarea
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Template Notes (e.g., Focus on strength)"
            />

            <h3>Exercises</h3>
            {exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex}>
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

                    {exercise.set_templates.map((set, setIndex) => (
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
            <button type="submit">Create Template</button>
        </form>
    );
}

export default CreateTemplateForm;
