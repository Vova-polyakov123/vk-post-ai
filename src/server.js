import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.HF_API_KEY;

// 🔥 НОВАЯ ПРОВЕРКА
app.get("/", (req, res) => {
    res.send("🔥 HF SERVER WORKING");
});

app.post("/generate", async (req, res) => {

    try {

        const { topic } = req.body;

        const response = await fetch(
            "https://api-inference.huggingface.co/models/google/flan-t5-large",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: `Напиши пост про ${topic}`
                })
            }
        );

        const data = await response.json();

        if (data?.[0]?.generated_text) {
            return res.json({ result: data[0].generated_text });
        }

        res.json({ result: "❌ нет ответа" });

    } catch (e) {
        res.json({ result: "❌ ошибка сервера" });
    }

});

app.listen(3001, () => console.log("🚀 HF server started"));