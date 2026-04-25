import { supabase } from "../supabase.js";

export default async function handler(req, res) {
    const { vk_id } = req.body;

    if (!vk_id) {
        return res.status(400).json({ error: "no vk_id" });
    }

    const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("vk_id", vk_id)
        .single();

    if (!user) {
        await supabase.from("users").insert([
            {
                vk_id,
                gen: 3,
                credits: 0,
                paid: 0
            }
        ]);
    }

    return res.json({ ok: true });
}