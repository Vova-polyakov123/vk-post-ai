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
    res.send("🔥 HF STABLE WORKING");
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

        if (type === "post") {
            prompt = `Напиши пост для ВКонтакте. Тема: ${topic}`;
        } else if (type === "ads") {
            prompt = `Напиши рекламный пост. Тема: ${topic}`;
        } else if (type === "ideas") {
            prompt = `Дай 10 идей постов: ${topic}`;
        } else if (type === "hashtags") {
            prompt = `Напиши 15 хештегов: ${topic}`;
        } else {
            prompt = `Напиши текст: ${topic}`;
        }

        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/google/flan-t5-large",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: prompt
                })
            }
        );

        const data = await response.json();

        console.log("HF STABLE:", data);

        // ❌ ошибка
        if (data?.error) {
            return res.json({
                result: "❌ HF ошибка: " + data.error
            });
        }

        // ✅ ответ
        if (Array.isArray(data) && data[0]?.generated_text) {
            return res.json({
                result: data[0].generated_text
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
    console.log(`🚀 HF STABLE server started on ${PORT}`);
});