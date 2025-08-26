import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../api";

function CreateWorkoutForm() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today
    const navigate = useNavigate();

    // Fetch available templates
    useEffect(() => {
        api.get("/workout-templates/")
            .then((res) => {
                setTemplates(res.data);
                if (res.data.length > 0) {
                    setSelectedTemplate(res.data[0].id);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        api.post("/workouts/", { template: selectedTemplate, date: date })
            .then((res) => {
                if (res.status === 201) {
                    alert("Workout created successfully!");
                    navigate(`/workouts/${res.data.id}`);
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Workout</h2>
            <label htmlFor="template-select">Template: </label>
            <select
                id="template-select"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
            >
                {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                        {template.name}
                    </option>
                ))}
            </select>
            <br />
            <label htmlFor="date-input">Date:</label>
            <input
                id="date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <br />
            <button type="submit">Create Workout</button>
        </form>
    );
}

export default CreateWorkoutForm;
