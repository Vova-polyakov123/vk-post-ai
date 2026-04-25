import { supabase } from "../supabase.js";

export default async function handler(req, res) {
    const { vk_id, action } = req.body;

    if (!vk_id || !action) {
        return res.status(400).json({ error: "missing data" });
    }

    // получаем пользователя
    const { data: user, error } = await supabase
        .from("users")
        .select("credits, gen")
        .eq("vk_id", vk_id)
        .single();

    if (error || !user) {
        return res.status(404).json({ error: "user not found" });
    }

    let update = {};

    // 🎁 награды (безопасные для модерации VK)
    switch (action) {
        case "daily":
            update.credits = (user.credits || 0) + 1;
            break;

        case "login":
            update.gen = (user.gen || 0) + 1;
            break;

        default:
            return res.status(400).json({ error: "invalid action" });
    }

    // обновляем
    await supabase
        .from("users")
        .update(update)
        .eq("vk_id", vk_id);

    return res.json({
        ok: true,
        updated: update
    });
}