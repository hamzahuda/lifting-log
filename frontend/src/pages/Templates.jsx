import { useState, useEffect } from "react";
import api from "../api";

export default function Templates() {
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        getTemplates();
    }, []);

    function getTemplates() {
        api.get("/workout-templates/")
            .then((result) => {
                setTemplates(result.data);
                console.log(result);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    return (
        <div>
            <h1>Templates Page</h1>
            <h2>Your Workout Templates</h2>
            <div>
                {templates.map((template) => (
                    <div key={template.id}>
                        <h3>{template.name}</h3>
                        <p>Notes: {template.notes}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
