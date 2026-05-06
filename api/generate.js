// api/generate.js
export default async function handler(req, res) {
    // CORS для VK
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ✅ Исправлено: принимаем theme (как в фронтенде) и mode
    const { theme, mode = 'post' } = req.body;
    if (!theme?.trim()) {
        return res.status(400).json({ error: 'theme is required' });
    }

    // Инструкции для каждого режима
    const modeInstructions = {
        ads: 'короткий продающий рекламный текст для VK. Используй эмодзи, выгоды, призыв. Длина 500–1000 символов.',
        post: 'полезный вовлекающий пост для VK. Дай 3–5 фактов или советов. Добавь хештеги и вопрос к аудитории. 800–1500 символов.',
        sales: 'продающий текст с отработкой возражений. Добавь оффер, гарантию, кейс. 600–1200 символов.',
        idea: '5–7 креативных идей для контента на тему. Каждую идею опиши в 1–2 предложениях. 600–1000 символов.',
        motivation: 'мотивирующий текст, заряжающий энергией. Короткие фразы, личный тон. 500–800 символов.',
        scripts: 'сценарий для Reels на 30–60 секунд. Разбей по времени: хук, проблема, решение, призыв. 500–800 символов.',
        chat: 'готовый ответ менеджера клиенту с возражением. Дай 2 варианта: мягкий и жёсткий. 400–700 символов.',
        viral: 'вирусный пост с неожиданными фактами, интригой. Призыв сохранить и отправить другу. 600–1000 символов.',
        business: 'деловой пост для предпринимателей: проблема, анализ, решение, оффер. 800–1500 символов.'
    };

    const instruction = modeInstructions[mode] || modeInstructions.post;

    const systemPrompt = `Ты профессиональный копирайтер для VK. Пиши живо, с эмодзи, короткими абзацами. Без воды, шаблонов, канцелярита. Не объясняй, как писать, не давай советов — сразу выдавай готовый текст. Используй заголовки, списки, хештеги, призыв к действию.`;

    const userPrompt = `Тема: ${theme.trim()}\nЗадача: ${instruction}\nНапиши уникальный, цепляющий текст строго на эту тему. Сразу выдай готовый пост.`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                temperature: 1.0,
                max_tokens: 2000,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim() || 'Ошибка генерации. Попробуйте ещё раз.';
        return res.status(200).json({ text });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
}