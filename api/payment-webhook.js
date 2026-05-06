import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { event, object } = req.body;
    console.log('Webhook received:', event, object?.id);

    if (event !== 'payment.succeeded') {
        return res.status(200).json({ received: true });
    }

    const userId = object?.metadata?.userId;
    if (!userId) {
        console.error('Webhook: userId missing');
        return res.status(200).json({ received: true, error: 'No userId' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('Webhook: Supabase credentials missing');
        return res.status(500).json({ error: 'Supabase config error' });
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
            console.error('Webhook upsert error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log(`✅ Webhook activated premium for ${userId}`);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Webhook error:', err);
        return res.status(500).json({ error: 'Internal error' });
    }
}