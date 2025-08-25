import { useEffect, useState } from "react";

const BLANK_TEMPLATE = {
    name: "",
    notes: "",
    exercise_templates: [],
};

function TemplateForm({ formType, originalTemplate, onSubmit }) {
    // If editing use the original template. If creating, use blank
    const initialData = originalTemplate || BLANK_TEMPLATE;
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        // Deep copy of og template
        setFormData(JSON.parse(JSON.stringify(initialData)));
    }, [originalTemplate]);

    // Handlers for form state changes
    const handleAddExercise = () => {
        const newExercise = {
            id: `temp-${Date.now()}`,
            name: "",
            rest_period: "00:02:00",
            min_reps: 8,
            max_reps: 12,
            notes: "",
            set_templates: [{ id: `temp-set-${Date.now()}`, notes: "" }],
        };
        setFormData({
            ...formData,
            exercise_templates: [...formData.exercise_templates, newExercise],
        });
    };

    const handleExerciseChange = (index, event) => {
        const newExercises = [...formData.exercise_templates];
        newExercises[index][event.target.name] = event.target.value;
        setFormData({ ...formData, exercise_templates: newExercises });
    };

    const handleRemoveExercise = (index) => {
        const newExercises = [...formData.exercise_templates];
        newExercises.splice(index, 1);
        setFormData({ ...formData, exercise_templates: newExercises });
    };

    const handleAddSet = (exerciseIndex) => {
        const newExercises = [...formData.exercise_templates];
        const newSet = { id: `temp-set-${Date.now()}`, notes: "" };
        newExercises[exerciseIndex].set_templates.push(newSet);
        setFormData({ ...formData, exercise_templates: newExercises });
    };

    const handleSetChange = (exerciseIndex, setIndex, event) => {
        const newExercises = [...formData.exercise_templates];
        newExercises[exerciseIndex].set_templates[setIndex][event.target.name] =
            event.target.value;
        setFormData({ ...formData, exercise_templates: newExercises });
    };

    const handleRemoveSet = (exerciseIndex, setIndex) => {
        const newExercises = [...formData.exercise_templates];
        newExercises[exerciseIndex].set_templates.splice(setIndex, 1);
        setFormData({ ...formData, exercise_templates: newExercises });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Pass final form data to parent's handler
        onSubmit(formData);
        // reset form after creation
        if (formType === "create") {
            setFormData(JSON.parse(JSON.stringify(BLANK_TEMPLATE)));
        }
    };

    if (!formData) {
        return <div>Loading form...</div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>
                {formType === "create"
                    ? "Create New Template"
                    : "Edit Template"}
            </h2>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Template Name (e.g., Upper Body)"
                required
            />
            <textarea
                name="notes"
                value={formData.notes}
                onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Template Notes (e.g., Focus on strength)"
            />

            <h3>Exercises</h3>
            {formData.exercise_templates.map((exercise, exerciseIndex) => (
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
            <button type="submit">
                {formType === "create" ? "Create Template" : "Save Changes"}
            </button>
        </form>
    );
}

export default TemplateForm;
