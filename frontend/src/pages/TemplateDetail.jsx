import { useState, useEffect } from "react";
import { useParams } from "react-router";
import api from "../api";

function TemplateDetail() {
    const { id } = useParams();
    const [template, setTemplate] = useState(null);

    useEffect(() => {
        api.get(`/workout-templates/${id}/`)
            .then((res) => {
                setTemplate(res.data);
            })
            .catch((err) => alert(err));
    }, []);

    if (!template) {
        return <div>Loading template...</div>;
    }

    return (
        <div>
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
                            Set {index + 1} {set.notes ? `(${set.notes})` : ""}
                        </p>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default TemplateDetail;
