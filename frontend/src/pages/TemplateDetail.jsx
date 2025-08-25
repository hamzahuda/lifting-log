import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../api";
import EditTemplateForm from "../components/EditTemplateForm";

function TemplateDetail() {
    const { id } = useParams();
    const [template, setTemplate] = useState(null);

    const [isEditing, setIsEditing] = useState(false);

    let navigate = useNavigate();

    const getTemplate = () => {
        api.get(`/workout-templates/${id}/`)
            .then((res) => {
                setTemplate(res.data);
            })
            .catch((err) => alert(err));
    };

    useEffect(() => {
        getTemplate();
    }, [id]);

    if (!template) {
        return <div>Loading template...</div>;
    }

    const handleSave = () => {
        setIsEditing(false);
        getTemplate();
    };

    const handleDeleteTemplate = () => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            api.delete(`/workout-templates/${id}/`)
                .then(() => {
                    alert("Template deleted successfully!");
                    navigate("/templates");
                })
                .catch((err) => alert(err));
        }
    };

    return (
        <div>
            {isEditing ? (
                <EditTemplateForm
                    originalTemplate={template}
                    onSave={handleSave}
                />
            ) : (
                <>
                    <h1>Template Name: {template.name}</h1>
                    <p>Template Notes: {template.notes}</p>
                    {template.exercise_templates.map((exercise) => (
                        <div key={exercise.id}>
                            <p>--</p>
                            <p>{exercise.name}</p>
                            <p>
                                {exercise.min_reps} - {exercise.max_reps} reps
                            </p>
                            <p>{exercise.rest_period} rest</p>
                            <p>Notes: {exercise.notes}</p>

                            {exercise.set_templates.map((set, index) => (
                                <p key={set.id}>
                                    Set {index + 1}{" "}
                                    {set.notes ? `(${set.notes})` : ""}
                                </p>
                            ))}
                        </div>
                    ))}
                </>
            )}
            <button
                type="button"
                onClick={() => {
                    setIsEditing(!isEditing);
                }}
            >
                {isEditing ? "Exit Editing Without Saving" : "Edit Template"}
            </button>
            {!isEditing && (
                <button type="button" onClick={handleDeleteTemplate}>
                    Delete Template
                </button>
            )}
        </div>
    );
}

export default TemplateDetail;
