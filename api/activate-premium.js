import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'userId required' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + 30);

    try {
        const { error } = await supabase
            .from('users')
            .upsert({
                user_id: userId,
                is_premium: true,
                premium_until: premiumUntil.toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('Upsert error:', error);
            return res.status(500).json({ error: 'Database error: ' + error.message });
        }

        console.log(`✅ Premium activated for ${userId} until ${premiumUntil.toISOString()}`);
        return res.status(200).json({ success: true, premiumUntil: premiumUntil.toISOString() });
    } catch (err) {
        console.error('Activation error:', err);
        return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
}