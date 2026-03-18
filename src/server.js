import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;

// 💥 ХРАНИМ ЛИМИТЫ (по user_id)
const userLimits = {};

const FREE_LIMIT = 3;

// 🔥 проверка
app.get("/", (req, res) => {
    res.send("🔥 AI WITH LIMIT WORKING");
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

        // 💥 считаем запросы
        if (!userLimits[userId]) {
            userLimits[userId] = 0;
        }

        userLimits[userId]++;

        // ❌ если лимит превышен
        if (userLimits[userId] > FREE_LIMIT) {
            return res.json({
                result: "💰 Бесплатные запросы закончились. Купи PRO доступ."
            });
        }

        const prompt = `Напиши пост для ВКонтакте на тему: ${topic}`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3-8b-instruct",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();

        if (data?.choices?.length > 0) {
            return res.json({
                result: data.choices[0].message.content,
                remaining: FREE_LIMIT - userLimits[userId]
            });
        }

        res.json({ result: "❌ AI не ответил" });

    } catch (error) {

        console.log(error);

        res.json({
            result: "❌ Ошибка сервера"
        });

    }

});

app.listen(3001, () => console.log("🚀 AI LIMIT SERVER"));