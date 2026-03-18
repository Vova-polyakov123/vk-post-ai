import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;

// 🔍 проверка
app.get("/", (req, res) => {
    res.send("AI сервер работает 🚀 NEW VERSION");
});

// 🚀 генерация
app.post("/generate", async (req, res) => {

    try {

        if (!API_KEY) {
            return res.json({ result: "❌ Нет API ключа" });
        }

        const { topic, type, category } = req.body;

        if (!topic) {
            return res.json({ result: "❌ Введи тему" });
        }

        let prompt = "";

        if (type === "post") {
            prompt = `
Напиши вирусный пост для ВКонтакте.

Категория: ${category}
Тема: ${topic}

Формат:
🔥 Заголовок
Текст (5-7 строк)
📲 Призыв к действию

Только русский язык.
`;
        }

        else if (type === "ads") {
            prompt = `
Напиши продающий рекламный пост для ВКонтакте.

Тема: ${topic}

Формат:
💥 Заголовок
😱 Проблема
🔥 Решение
💰 Выгоды
📲 Призыв

Только русский язык.
`;
        }

        else if (type === "ideas") {
            prompt = `Дай 10 идей постов на тему: ${topic}`;
        }

        else if (type === "hashtags") {
            prompt = `Напиши 15 хештегов для темы: ${topic}`;
        }

        // ✅ ТОЛЬКО ЖИВЫЕ МОДЕЛИ (БЕЗ openchat)
        const models = [
            "meta-llama/llama-3-8b-instruct",
            "mistralai/mistral-7b-instruct:free",
            "google/gemma-7b-it:free"
        ];

        let result = null;
        let lastError = null;

        for (const model of models) {

            try {

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            {
                                role: "system",
                                content: "Ты SMM специалист. Пиши только на русском языке."
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        temperature: 0.9,
                        max_tokens: 1000
                    })
                });

                const data = await response.json();

                console.log("MODEL:", model);
                console.log("RESPONSE:", JSON.stringify(data, null, 2));

                if (data?.choices?.length > 0) {
                    result = data.choices[0].message.content.trim();
                    break;
                }

                if (data?.error) {
                    lastError = data.error.message;
                }

            } catch (err) {
                lastError = err.message;
            }
        }

        // ❌ если не получилось
        if (!result) {
            return res.json({
                result: `❌ AI не ответил\nПричина: ${lastError || "нет ответа"}`
            });
        }

        res.json({ result });

    } catch (error) {

        console.log("SERVER ERROR:", error);

        res.json({
            result: "❌ Ошибка сервера"
        });

    }

});

// 🚀 запуск
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на ${PORT}`);
});