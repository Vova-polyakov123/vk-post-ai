import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 ключи
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const HF_KEY = process.env.HF_API_KEY;

// 💾 один пользователь (фикс навсегда)
const USER_ID = "demo_user";

const users = {
    [USER_ID]: {
        requests: 0,
        freeUsed: 0
    }
};

// 🎁 бесплатные
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

    if (PACKAGES[plan]) {
        users[USER_ID].requests += PACKAGES[plan];
    }

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

        let usePro = false;

        // 🎁 FREE
        if (users[USER_ID].freeUsed < FREE_LIMIT) {
            users[USER_ID].freeUsed++;
        } else {
            if (users[USER_ID].requests <= 0) {
                return res.json({
                    result: "💰 Бесплатные попытки закончились",
                    freeLeft: 0,
                    paidLeft: 0
                });
            }
            users[USER_ID].requests--;
            usePro = true;
        }

        const prompt = `
Напиши вирусный пост для ВКонтакте.

Тема: ${topic}

Формат:
🔥 Заголовок
📖 5-7 строк текста
👉 Призыв

Пиши эмоционально и на русском.
`;

        let result = "";

        // =========================
        // 💰 PRO (OpenRouter)
        // =========================
        if (usePro && OPENROUTER_KEY) {
            try {

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
                        temperature: 0.9,
                        max_tokens: 800
                    })
                });

                const data = await response.json();

                if (data?.choices?.length > 0) {
                    result = data.choices[0].message.content;
                } else if (data?.error) {
                    result = "❌ PRO ошибка: " + (data.error.message || "unknown");
                }

            } catch (e) {
                console.log("PRO ERROR:", e);
                result = "❌ Ошибка PRO сервера";
            }
        }

        // =========================
        // 🆓 FREE (HF)
        // =========================
        if (!result) {

            if (!HF_KEY) {
                result = "❌ Нет HF ключа";
            } else {

                try {

                    const response = await fetch(
                        "https://router.huggingface.co/v1/chat/completions",
                        {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${HF_KEY}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                model: "HuggingFaceH4/zephyr-7b-beta",
                                messages: [
                                    { role: "user", content: prompt }
                                ],
                                max_tokens: 500
                            })
                        }
                    );

                    const data = await response.json();

                    console.log("HF RESPONSE:", data);

                    if (data?.choices?.length > 0) {
                        result = data.choices[0].message.content;
                    } else if (data?.error) {
                        result = "❌ HF ошибка: " + (data.error.message || "unknown");
                    } else {
                        result = "❌ FREE AI не ответил";
                    }

                } catch (e) {
                    console.log("HF ERROR:", e);
                    result = "❌ Ошибка HF сервера";
                }
            }
        }

        res.json({
            result,
            freeLeft: Math.max(0, FREE_LIMIT - users[USER_ID].freeUsed),
            paidLeft: users[USER_ID].requests
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
    console.log(`🚀 SERVER STARTED ON ${PORT}`);
});