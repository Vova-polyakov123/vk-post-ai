import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// init user
app.post("/user/init", (req, res) => {
    res.json({ ok: true });
});

// генерация
app.post("/generate", async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + process.env.OPENROUTER_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3-70b-instruct",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();

        res.json({
            text: data.choices?.[0]?.message?.content || "Ошибка генерации"
        });

    } catch (e) {
        console.log(e);
        res.json({ text: "Ошибка сервера" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log("🚀 SERVER STARTED ON " + PORT);
});