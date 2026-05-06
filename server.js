// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

let fetch;
try {
    fetch = globalThis.fetch;
    if (!fetch) throw new Error();
} catch (e) {
    fetch = require('node-fetch');
    console.log('⚠️ Используется node-fetch (Node.js <18)');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/generate', async (req, res) => {
    const { theme, mode } = req.body;
    console.log(`\n🔔 [${new Date().toLocaleTimeString()}] Запрос: тема="${theme}", режим="${mode}"`);

    if (!theme || !mode) {
        return res.status(400).json({ error: 'Не хватает параметров' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('❌ OPENROUTER_API_KEY не задан в .env');
        return res.status(500).json({ error: 'Ключ API не настроен' });
    }

    const prompts = {
        ads: "Ты профессиональный копирайтер. Напиши рекламный пост с цепляющим заголовком, выгодой и призывом. Используй эмодзи, списки.",
        post: "Ты эксперт по контент-маркетингу. Напиши полезный пост для соцсетей: личный опыт, 3-5 советов, вопрос в конце.",
        sales: "Ты менеджер по продажам. Напиши скрипт продажи: разбор возражений, гарантии, УТП, призыв к действию.",
        idea: "Ты креативный продюсер. Сгенерируй 5 идей для контента на тему. Каждую опиши в 1-2 предложениях.",
        motivation: "Ты мотивационный спикер. Напиши вдохновляющий текст до 200 слов с сильной концовкой.",
        scripts: "Ты сценарист для Reels/TikTok. Напиши сценарий на 30-60 секунд: хук, проблема, решение, призыв.",
        chat: "Ты специалист по работе с клиентами. Напиши скрипт ответа на возражение. Два варианта: мягкий и жёсткий.",
        viral: "Ты вирусный маркетолог. Напиши провокационный пост, который захочется переслать. Интрига, эмоции.",
        business: "Ты B2B-маркетолог. Напиши коммерческое предложение: выгоды, цифры, кейсы, оффер."
    };
    const systemPrompt = prompts[mode] || prompts.ads;
    const userPrompt = `Тема: ${theme}\nРежим: ${mode}\nСгенерируй качественный текст как настоящий эксперт.`;

    try {
        console.log('🚀 Отправка запроса в OpenRouter...');
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': `http://localhost:${PORT}`,
                'X-Title': 'AI Content Studio'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 700
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ OpenRouter ошибка ${response.status}:`, errorText);
            return res.status(500).json({ error: `OpenRouter: ${response.status}` });
        }

        const data = await response.json();
        const generatedText = data.choices[0].message.content;
        console.log(`✅ Генерация успешна (${generatedText.length} символов)`);
        res.json({ text: generatedText });
    } catch (err) {
        console.error('❌ Ошибка при запросе:', err.message);
        res.status(500).json({ error: 'Ошибка сети или сервера: ' + err.message });
    }
});

app.get('/*splat', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api/generate`);
    console.log(`   Убедитесь, что в файле .env указан OPENROUTER_API_KEY\n`);
});