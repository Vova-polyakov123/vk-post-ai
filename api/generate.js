export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(200).json({ ok: true });
    }

    try {

        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ text: "Нет prompt" });
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(500).json({ text: "Нет OPENROUTER_API_KEY" });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                temperature: 0.9,
                max_tokens: 1200,
                messages: [
                    {
                        role: "system",
                        content: "Ты пишешь длинные продающие VK посты без повторов и шаблонов."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        // 🔥 ВАЖНО — проверка ошибки API
        if (!response.ok) {
            const err = await response.text();
            console.log("OPENROUTER ERROR:", err);
            return res.status(500).json({
                text: "Ошибка OpenRouter API"
            });
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
            console.log("BAD RESPONSE:", data);
            return res.status(500).json({
                text: "Пустой ответ модели"
            });
        }

        return res.status(200).json({
            text: data.choices[0].message.content
        });

    } catch (e) {
        console.log("SERVER ERROR:", e);

        return res.status(500).json({
            text: "Ошибка сервера"
        });
    }
}