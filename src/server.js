import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

app.get("/", (req, res) => {
    res.send("AI сервер работает");
});

app.post("/generate", async (req, res) => {

    try {

        const { topic, type, category } = req.body;

        let prompt = "";

        if (type === "post") {
            prompt = `Напиши короткий пост для ВКонтакте. Категория: ${category}. Тема: ${topic}`;
        }

        if (type === "ideas") {
            prompt = `Дай 10 идей постов для ВКонтакте на тему ${topic}`;
        }

        if (type === "hashtags") {
            prompt = `Сделай популярные хештеги для темы ${topic}`;
        }

        if (type === "ads") {
            prompt = `Напиши рекламный текст для темы ${topic}`;
        }

        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/google/flan-t5-small",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: prompt
                })
            }
        );

        const data = await response.json();

        console.log("AI ответ:", data);

        let result = "AI не смог сгенерировать текст";

        if (Array.isArray(data)) {
            result = data[0]?.generated_text || result;
        }

        if (data.error) {
            result = data.error;
        }

        res.json({ result });

    } catch (error) {

        console.log("SERVER ERROR:", error);

        res.json({
            result: "Ошибка генерации"
        });

    }

});

app.listen(3001, () => {
    console.log("AI сервер работает на порту 3001");
});