export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    if (!shopId || !secretKey) {
        return res.status(500).json({ error: 'Платёжная система не настроена' });
    }

    const idempotenceKey = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    try {
        const yooResponse = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Idempotence-Key': idempotenceKey,
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify({
                amount: { value: '149.00', currency: 'RUB' },
                capture: true,
                confirmation: { type: 'embedded' },
                metadata: { userId }
            })
        });

        const data = await yooResponse.json();
        if (!yooResponse.ok) {
            return res.status(yooResponse.status).json({ error: data.description || 'Ошибка ЮKassa' });
        }
        if (!data.confirmation?.confirmation_token) {
            return res.status(500).json({ error: 'ЮKassa не вернула токен' });
        }
        res.status(200).json({ confirmationToken: data.confirmation.confirmation_token });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
}