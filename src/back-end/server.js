require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for specific origins
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.ALLOWED_ORIGIN
        ];
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Built-in middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/", (req, res) => res.send("Hello"));
app.post('/api/plan-day', async (req, res) => {
    const tasks = req.body.tasks;

    const p = {
        contents: [
            { parts: [{ text: `Optimally plan out a very simple day for the following tasks: ${tasks.join(', ')}. Just list out the tasks in the best order and the time of day (e.g 10:30 AM) they should be done. Include the reasoning for the order or time of day at the end of each task in parenthesis.`}] }
        ]
    };

    // Simulate LLM call to plan the day
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.LLM_API_KEY}`, JSON.stringify(p), {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    console.log(text);

    /*
Go to the library to vote
Go for a 20 minute run
Prepare for meeting with Jessica at work
Go get a burger
Help daughter with Science project
Mow the lawn
Send email to friend

    Here's a possible optimal schedule for your day:

*   **7:00 AM:** Go for a 20 minute run (Get exercise out of the way early, before it gets too hot and before other commitments take over).

*   **7:30 AM:** Mow the lawn (Following the run while you are already outside and have a sweat going, avoid the hotter hours of the day).

*   **9:00 AM:** Prepare for meeting with Jessica at work (Allows ample time to review materials, gather thoughts, and address any last-minute concerns before the meeting, assuming the meeting is late morning or afternoon).

*   **12:00 PM:** Go get a burger (Lunch time, a convenient break during the day).

*   **4:00 PM:** Help daughter with Science project (After school, allows time for her to get home and settled. Provides sufficient time to dedicate to the project).

*   **5:00 PM:** Go to the library to vote (After work/helping with the science project and before it gets too late, ensuring you have time to vote and any potential lines aren't too long).
    */

    const lines = text.split('\n').filter(line => line.trim().startsWith('*')).map(line => line.replace(/\*\*/g, ''));
    console.log(lines.join('\n'));

    const plans = lines.map(line => {
        const trimmedLine = line.trim().slice(1).trim(); // Remove the bullet and trim
        const [timePart, rest] = trimmedLine.split(': ');
        const time = timePart.trim();
        const taskAndReason = rest.split('(');
        const task = taskAndReason[0].trim();
        const reason = taskAndReason[1] ? taskAndReason[1].slice(0, -1).trim() : '';

        return { time, task, reason };
    });

    res.json(plans);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});