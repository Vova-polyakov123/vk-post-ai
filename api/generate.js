export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(200).json({ ok: true });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({
            text: "Нет prompt"
        });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://mini-app-delta-roan.vercel.app",
                "X-Title": "VK AI App"
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo", // ✅ РАБОЧАЯ МОДЕЛЬ
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();

        // 🔥 если OpenRouter вернул ошибку
        if (data.error) {
            return res.status(200).json({
                text: "Ошибка AI: " + data.error.message
            });
        }

        // 🔥 если нет ответа
        if (!data.choices || !data.choices[0]) {
            return res.status(200).json({
                text: "AI не ответил"
            });
        }

        return res.status(200).json({
            text: data.choices[0].message.content
        });

    } catch (e) {
        return res.status(500).json({
            text: "Ошибка сервера: " + e.message
        });
    }
}