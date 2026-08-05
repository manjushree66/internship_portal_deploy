// routes/chatRoutes.js
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || message.trim() === "") {
            return res.status(400).json({ error: "Message cannot be empty." });
        }

        const apiResponse = await fetch('http://127.0.0.1:8000/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        if (!apiResponse.ok) {
            console.error(`Python API returned status ${apiResponse.status}`);
            return res.status(500).json({ error: "Failed to process RAG pipeline." });
        }

        const data = await apiResponse.json();
        return res.status(200).json({ reply: data.reply });

    } catch (error) {
        console.error("Route Error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;