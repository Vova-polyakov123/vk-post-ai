import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 ключи
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const HF_KEY = process.env.HF_API_KEY;

// 💾 база пользователей (временно в памяти)
const users = {};

// 🎁 бесплатные запросы
const FREE_LIMIT = 3;

// 💰 пакеты
const PACKAGES = {
    mini: 20,
    pro: 100,
    ultra: 300
};

// 🔥 проверка
app.get("/", (req, res) => {
    res.send("🔥 AI PRO SERVER WORKING");
});

// 💳 покупка
app.post("/buy", (req, res) => {

    const { userId, plan } = req.body;

    if (!users[userId]) {
        users[userId] = { requests: 0, freeUsed: 0 };
    }

    if (PACKAGES[plan]) {
        users[userId].requests += PACKAGES[plan];
    }

    res.json({ success: true, balance: users[userId] });
});

// 🚀 генерация
app.post("/generate", async (req, res) => {

    try {

        const { topic, userId } = req.body;

        if (!topic) {
            return res.json({ result: "❌ Введи тему" });
        }

        if (!userId) {
            return res.json({ result: "❌ Нет userId" });
        }

        if (!users[userId]) {
            users[userId] = { requests: 0, freeUsed: 0 };
        }

        let usePro = false;

        // 🎁 бесплатные попытки
        if (users[userId].freeUsed < FREE_LIMIT) {
            users[userId].freeUsed++;
        } else {
            // 💰 платные
            if (users[userId].requests <= 0) {
                return res.json({
                    result: "💰 Бесплатные попытки закончились. Купи PRO.",
                    freeLeft: 0,
                    paidLeft: 0
                });
            }
            users[userId].requests--;
            usePro = true;
        }

        // 🔥 нормальный промпт
        const prompt = `
Ты профессиональный SMM-специалист.

Напиши мощный пост для ВКонтакте:
- цепляющий заголовок
- эмоции
- 5-7 строк
- эмодзи
- призыв к действию

Тема: ${topic}

Пиши строго на русском языке.
`;

        let result = "";

        // =========================
        // 💰 PRO (OpenRouter)
        // =========================
        if (usePro && OPENROUTER_KEY) {

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-3-8b-instruct",
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.8,
                    max_tokens: 800
                })
            });

            const data = await response.json();

            if (data?.choices?.length > 0) {
                result = data.choices[0].message.content;
            } else {
                result = "❌ PRO AI не ответил";
            }

        }

        // =========================
        // 🆓 FREE (HuggingFace)
        // =========================
        else {

            const response = await fetch(
                "https://router.huggingface.co/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${HF_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "google/gemma-2b-it",
                        messages: [
                            { role: "user", content: prompt }
                        ],
                        max_tokens: 500
                    })
                }
            );

            const data = await response.json();

            console.log("HF:", data);

            if (data?.choices?.length > 0) {
                result = data.choices[0].message.content;
            } else if (data?.error) {
                result = "❌ HF ошибка: " + JSON.stringify(data.error);
            } else {
                result = "❌ FREE AI не ответил";
            }
        }

        res.json({
            result,
            freeLeft: Math.max(0, FREE_LIMIT - users[userId].freeUsed),
            paidLeft: users[userId].requests
        });

    } catch (error) {

        console.log("SERVER ERROR:", error);

        res.json({
            result: "❌ Ошибка сервера"
        });

    }

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 SERVER STARTED ON ${PORT}`);
});