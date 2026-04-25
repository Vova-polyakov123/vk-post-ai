import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🧠 временная база (потом можно Mongo)
let users = {};

// 📌 получить баланс
app.post("/api/user", (req, res) => {
    const { user_id } = req.body;

    if (!users[user_id]) {
        users[user_id] = { free: 3 };
    }

    res.json(users[user_id]);
});

// ✨ генерация
app.post("/api/generate", async (req, res) => {
    const { prompt, user_id } = req.body;

    if (!users[user_id]) users[user_id] = { free: 3 };

    if (users[user_id].free <= 0) {
        return res.status(400).json({ error: "Нет генераций" });
    }

    users[user_id].free--;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();

        res.json({
            text: data.choices?.[0]?.message?.content || "Ошибка",
            free: users[user_id].free
        });

    } catch (e) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// 💰 начисление после оплаты
app.post("/api/payment", (req, res) => {
    const { user_id, amount } = req.body;

    if (!users[user_id]) users[user_id] = { free: 3 };

    if (amount == 30) users[user_id].free += 15;
    if (amount == 100) users[user_id].free += 50;
    if (amount == 300) users[user_id].free += 150;

    res.json({ success: true, free: users[user_id].free });
});

app.listen(3001, () => console.log("🚀 SERVER 3001"));