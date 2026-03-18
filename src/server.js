import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.HF_API_KEY;

// ✅ ПРОВЕРКА
app.get("/", (req, res) => {
    res.send("🔥 HF FINAL WORKING");
});

// 🚀 ГЕНЕРАЦИЯ
app.post("/generate", async (req, res) => {

    try {

        if (!API_KEY) {
            return res.json({ result: "❌ Нет HF ключа" });
        }

        const { topic } = req.body;

        if (!topic) {
            return res.json({ result: "❌ Введи тему" });
        }

        const prompt = `Напиши красивый пост для ВКонтакте на тему: ${topic}. Добавь эмоции и призыв к действию.`;

        // ❗ ТОЛЬКО НОВЫЙ API (без старых ссылок)
        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "mistralai/mistral-7b-instruct",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 500
                })
            }
        );

        const data = await response.json();

        console.log("HF FINAL RESPONSE:", JSON.stringify(data, null, 2));

        if (data?.error) {
            return res.json({
                result: "❌ HF ошибка: " + data.error.message
            });
        }

        if (data?.choices?.length > 0) {
            return res.json({
                result: data.choices[0].message.content
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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 HF FINAL server started on ${PORT}`);
});