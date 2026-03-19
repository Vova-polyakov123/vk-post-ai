import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 🔑 ключ
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// 💾 пользователь (один)
const USER_ID = "demo_user";

const users = {
    [USER_ID]: {
        requests: 0,
        freeUsed: 0
    }
};

// 🎁 лимиты
const FREE_LIMIT = 3;

// 💰 пакеты
const PACKAGES = {
    mini: 20,
    pro: 100,
    ultra: 300
};

// 🔥 проверка
app.get("/", (req, res) => {
    res.send("🔥 AI FINAL FIXED WORKING");
});

// 💳 покупка
app.post("/buy", (req, res) => {
    const { plan } = req.body;

    if (!PACKAGES[plan]) {
        return res.json({ success: false, error: "❌ Неверный пакет" });
    }

    users[USER_ID].requests += PACKAGES[plan];

    res.json({
        success: true,
        balance: users[USER_ID]
    });
});

// 🚀 генерация
app.post("/generate", async (req, res) => {

    try {

        const { topic } = req.body;

        if (!topic) {
            return res.json({ result: "❌ Введи тему" });
        }

        if (!OPENROUTER_KEY) {
            return res.json({ result: "❌ Нет OpenRouter ключа" });
        }

        let usePro = false;

        // 🎁 бесплатные
        if (users[USER_ID].freeUsed < FREE_LIMIT) {
            users[USER_ID].freeUsed++;
        } else {
            // 💰 платные
            if (users[USER_ID].requests <= 0) {
                return res.json({
                    result: "💰 Бесплатные закончились. Купи PRO.",
                    freeLeft: 0,
                    paidLeft: 0
                });
            }
            users[USER_ID].requests--;
            usePro = true;
        }

        const prompt = `
Ты профессиональный SMM специалист.

Напиши вирусный пост для ВКонтакте:

Тема: ${topic}

Формат:
🔥 Заголовок
📖 5-7 строк
👉 Призыв к действию

Пиши ярко, эмоционально и вовлекающе.
`;

        // 🔥 запрос к OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3-8b-instruct",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 800
            })
        });

        const data = await response.json();

        console.log("AI RESPONSE:", JSON.stringify(data, null, 2));

        // ❌ ошибка от AI
        if (data?.error) {
            return res.json({
                result: "❌ AI ошибка: " + data.error.message
            });
        }

        // ✅ норм ответ
        if (data?.choices?.length > 0) {
            return res.json({
                result: data.choices[0].message.content,
                freeLeft: Math.max(0, FREE_LIMIT - users[USER_ID].freeUsed),
                paidLeft: users[USER_ID].requests
            });
        }

        return res.json({
            result: "❌ AI не ответил"
        });

    } catch (error) {

        console.log("SERVER ERROR:", error);

        return res.json({
            result: "❌ Ошибка сервера"
        });

    }

});

// 🚀 запуск
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 SERVER STARTED ON ${PORT}`);
});