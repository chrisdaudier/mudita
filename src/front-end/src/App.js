import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

function App() {
    const [tasks, setTasks] = useState(``);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPlan('');
        setLoading(true);
        const tasksArray = tasks.split('\n').map(task => task.trim());
        const response = await api.post('/plan-day', { tasks: tasksArray });
        setPlan(response.data);
        setLoading(false);
    };

    return (
        <div className="App">
            <h1>Daily Planner</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter your tasks for the day (one per line):
                    <textarea
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        rows="10"
                        cols="50"
                    />
                </label>
                <button type="submit">Plan My Day</button>
            </form>
            {loading && (
                <div className="progress">
                    <div className="spinner"></div>
                    Planning your day...
                </div>
            )}
            {plan && (
                <div className="plan">
                    <h2>Your Optimized Daily Plan:</h2>
                    <ul>
                        {plan.map((item, index) => (
                            <li key={index}>
                                <strong>{item.time}:</strong> {item.task}
                                <p>{item.reason}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
