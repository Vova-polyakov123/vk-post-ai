import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return res.status(200).json({ isPremium: false });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
        const { data, error } = await supabase
            .from('users')
            .select('premium_until')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) throw error;
        let isPremium = false;
        if (data?.premium_until) {
            isPremium = new Date(data.premium_until) > new Date();
        }
        return res.status(200).json({ isPremium });
    } catch (err) {
        console.error('Check premium error:', err);
        return res.status(200).json({ isPremium: false });
    }
}