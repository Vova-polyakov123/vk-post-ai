import { supabase } from "../supabase.js";

export default async function handler(req, res) {
    const { vk_id } = req.query;

    if (!vk_id) {
        return res.status(400).json({ error: "no vk_id" });
    }

    const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("vk_id", vk_id)
        .single();

    return res.json(user || null);
}