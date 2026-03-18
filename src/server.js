import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;

// 🔍 Проверка
app.get("/", (req, res) => {
    res.send("🚀 AI сервер работает (FINAL)");
});

// 🚀 Генерация
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

        // 🔥 ЛОГИКА
        if (type === "post") {
            prompt = `
Напиши вирусный пост для ВКонтакте.

Категория: ${category}
Тема: ${topic}

Формат:
🔥 Заголовок
Текст (5-7 строк)
📲 Призыв

Пиши ярко, с эмоциями и эмодзи.
Только на русском языке.
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
📲 Призыв к действию

Только на русском языке.
`;
        }

        else if (type === "ideas") {
            prompt = `
Дай 10 идей постов для ВКонтакте на тему: ${topic}

Кратко, списком.
`;
        }

        else if (type === "hashtags") {
            prompt = `
Напиши 15 популярных хештегов для темы: ${topic}

Только список.
`;
        }

        else {
            prompt = `Напиши текст на тему: ${topic}`;
        }

        // ✅ ОДНА СТАБИЛЬНАЯ МОДЕЛЬ
        const model = "meta-llama/llama-3-8b-instruct";

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: "Ты профессиональный SMM специалист. Пиши только на русском языке."
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

        console.log("AI RESPONSE:", JSON.stringify(data, null, 2));

        // ❌ ошибка от AI
        if (data?.error) {
            return res.json({
                result: "❌ Ошибка AI: " + data.error.message
            });
        }

        // ✅ успех
        if (data?.choices?.length > 0) {
            const result = data.choices[0].message.content.trim();
            return res.json({ result });
        }

        // ❌ если пусто
        return res.json({
            result: "❌ AI не вернул текст"
        });

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