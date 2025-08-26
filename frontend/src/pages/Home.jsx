import { useState, useEffect } from "react";
import api from "../api";
import CreateWorkoutForm from "../components/CreateWorkoutForm";

export default function Home() {
    const [workouts, setWorkouts] = useState([]);

    useEffect(() => {
        getWorkouts();
    }, []);

    function getWorkouts() {
        api.get("/workouts/")
            .then((result) => {
                setWorkouts(result.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    return (
        <div>
            <h1>Home Page</h1>
            <h2>Your Workouts</h2>
            <div>
                {workouts.map((workout) => (
                    <div key={workout.id}>
                        <h3>{workout.name}</h3>
                        <p>Date: {workout.date}</p>
                        <p>Notes: {workout.notes}</p>
                    </div>
                ))}
            </div>
            <CreateWorkoutForm />
        </div>
    );
}
