import { useState, useEffect } from "react";
import api from "../api";
import TemplateForm from "../components/TemplateForm";
import { Link } from "react-router";

export default function Templates() {
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        getTemplates();
    }, []);

    function getTemplates() {
        api.get("/workout-templates/")
            .then((result) => {
                setTemplates(result.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    const handleCreateSubmit = (templateData) => {
        api.post("/workout-templates/", templateData)
            .then((res) => {
                if (res.status === 201) {
                    alert("Template created successfully!");
                    getTemplates();
                } else {
                    alert("Failed to create template.");
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <div>
            <h1>Templates Page</h1>
            <h2>Your Workout Templates</h2>
            <div>
                {templates.map((template) => (
                    <Link to={`/templates/${template.id}`} key={template.id}>
                        <h3>{template.name}</h3>
                        <p>Notes: {template.notes}</p>
                    </Link>
                ))}
            </div>
            <TemplateForm formType="create" onSubmit={handleCreateSubmit} />
        </div>
    );
}
