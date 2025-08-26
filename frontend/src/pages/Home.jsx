import { useState, useEffect } from "react";
import api from "../api";
import CreateWorkoutForm from "../components/CreateWorkoutForm";
import { Link } from "react-router";

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
                    <Link to={`/workouts/${workout.id}`} key={workout.id}>
                        <br />
                        <h3>{workout.name}</h3>
                        <p>Date: {workout.date}</p>
                        <p>Notes: {workout.notes}</p>
                    </Link>
                ))}
            </div>
            <CreateWorkoutForm />
        </div>
    );
}
