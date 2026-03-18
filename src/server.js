import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.HF_API_KEY;

// 🔥 ПРОВЕРКА
app.get("/", (req, res) => {
    res.send("🔥 HF SERVER WORKING");
});

// 🚀 ГЕНЕРАЦИЯ
app.post("/generate", async (req, res) => {

    try {

        if (!API_KEY) {
            return res.json({ result: "❌ Нет HF ключа" });
        }

        const { topic, type, category } = req.body;

        if (!topic) {
            return res.json({ result: "❌ Введи тему" });
        }

        let prompt = "";

        // 💡 логика генерации
        if (type === "post") {
            prompt = `
Напиши вирусный пост для ВКонтакте.

Категория: ${category}
Тема: ${topic}

Формат:
🔥 Заголовок
Текст (5-6 строк)
📲 Призыв

На русском языке.
`;
        }

        else if (type === "ads") {
            prompt = `
Напиши рекламный пост.

Тема: ${topic}

Формат:
💥 Заголовок
😱 Проблема
🔥 Решение
💰 Выгоды
📲 Призыв

На русском языке.
`;
        }

        else if (type === "ideas") {
            prompt = `Дай 10 идей постов на тему: ${topic}`;
        }

        else if (type === "hashtags") {
            prompt = `Напиши 15 хештегов для темы: ${topic}`;
        }

        else {
            prompt = `Напиши текст на тему: ${topic}`;
        }

        // 🔥 запрос к HF
        const response = await fetch(
            "https://api-inference.huggingface.co/models/google/flan-t5-large",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 300,
                        temperature: 0.9
                    }
                })
            }
        );

        const data = await response.json();

        console.log("HF RESPONSE:", JSON.stringify(data, null, 2));

        // ❌ ошибка HF
        if (data?.error) {
            return res.json({
                result: "❌ HF ошибка: " + data.error
            });
        }

        // ✅ нормальный ответ
        if (Array.isArray(data) && data[0]?.generated_text) {

            let text = data[0].generated_text;

            // ✨ убираем дубли prompt
            text = text.replace(prompt, "").trim();

            return res.json({
                result: text || "❌ Пустой ответ"
            });
        }

        return res.json({
            result: "❌ AI не ответил"
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
    console.log(`🚀 HF server started on ${PORT}`);
});