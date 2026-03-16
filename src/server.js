import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;

app.get("/", (req, res) => {
    res.send("AI сервер работает");
});

app.post("/generate", async (req, res) => {

    try {

        const { topic, type, category } = req.body;

        let prompt = "";

        if (type === "post") {
            prompt = `Напиши интересный пост для ВКонтакте. Категория: ${category}. Тема: ${topic}`;
        }

        if (type === "ideas") {
            prompt = `Дай 10 идей постов для ВКонтакте на тему ${topic}`;
        }

        if (type === "hashtags") {
            prompt = `Напиши популярные хештеги для темы ${topic}`;
        }

        if (type === "ads") {
            prompt = `Напиши рекламный текст для темы ${topic}`;
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct",
                messages: [
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        const result =
            data?.choices?.[0]?.message?.content ||
            "AI не смог сгенерировать текст";

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