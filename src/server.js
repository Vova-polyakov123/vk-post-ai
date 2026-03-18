import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;

// 🔍 проверка сервера
app.get("/", (req, res) => {
    res.send("AI сервер работает");
});

// 🚀 генерация
app.post("/generate", async (req, res) => {

    try {

        if (!API_KEY) {
            return res.json({
                result: "Ошибка: API ключ не найден"
            });
        }

        const { topic, type, category } = req.body;

        if (!topic) {
            return res.json({
                result: "Ошибка: тема не указана"
            });
        }

        let prompt = "";

        // 🔥 ЛОГИКА ПРОМПТОВ
        if (type === "post") {
            prompt = `
Ты профессиональный SMM-специалист.

Напиши вирусный пост для ВКонтакте:
- цепляющий заголовок
- эмоции
- эмодзи
- простой стиль
- призыв к действию

Категория: ${category}
Тема: ${topic}

Пиши ТОЛЬКО на русском языке.
`;
        }

        else if (type === "ideas") {
            prompt = `
Дай 10 идей постов для ВКонтакте на тему: ${topic}

Пиши кратко, списком.
На русском языке.
`;
        }

        else if (type === "hashtags") {
            prompt = `
Напиши 15 популярных хештегов для темы: ${topic}

Только хештеги, без лишнего текста.
`;
        }

        else if (type === "ads") {
            prompt = `
Напиши полноценный рекламный пост для ВКонтакте НА РУССКОМ ЯЗЫКЕ.

Требования:
- мощный заголовок
- 5-7 предложений
- выгоды для клиента
- эмоции
- призыв к действию
- без английского языка

Тема: ${topic}
`;
        }

        else {
            prompt = `Напиши текст на тему: ${topic}`;
        }

        // 🔥 ЗАПРОС К AI
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct", // ✅ стабильная модель
                messages: [
                    {
                        role: "system",
                        content: "Ты пишешь тексты только на русском языке для ВКонтакте."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 800
            })
        });

        const data = await response.json();

        console.log("AI ответ:", JSON.stringify(data, null, 2));

        let result = "AI не смог сгенерировать текст";

        // ✅ нормальный разбор ответа
        if (data?.choices?.length > 0) {
            result = data.choices[0].message.content.trim();
        }

        // ❗ обработка ошибок API
        if (data?.error) {
            console.log("AI ERROR:", data.error);
            result = "Ошибка AI: " + data.error.message;
        }

        res.json({ result });

    } catch (error) {

        console.log("SERVER ERROR:", error);

        res.json({
            result: "Ошибка генерации сервера"
        });

    }

});

// 🚀 запуск
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`AI сервер работает на порту ${PORT}`);
});