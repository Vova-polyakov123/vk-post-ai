import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// память не нужна — теперь Supabase

async function getUser(vk_id) {
    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("vk_id", vk_id)
        .single();

    if (data) return data;

    const { data: newUser } = await supabase
        .from("users")
        .insert([{ vk_id, free: 3, paid: 0 }])
        .select()
        .single();

    return newUser;
}

export default async function handler(req, res) {
    const { method, query, body } = req;

    // =========================
    // TEST
    // =========================
    if (method === "GET") {
        return res.json({ ok: true, msg: "API WORKING" });
    }

    // =========================
    // GENERATE
    // =========================
    if (method === "POST" && query.route === "generate") {
        const { vk_id, prompt } = body;

        const user = await getUser(vk_id);

        const total = user.free + user.paid;

        if (total <= 0) {
            return res.status(403).json({ error: "No credits" });
        }

        if (user.paid > 0) {
            await supabase
                .from("users")
                .update({ paid: user.paid - 1 })
                .eq("vk_id", vk_id);
        } else {
            await supabase
                .from("users")
                .update({ free: user.free - 1 })
                .eq("vk_id", vk_id);
        }

        return res.json({
            text: `AI: ${prompt}`,
        });
    }

    // =========================
    // PAYMENT
    // =========================
    if (method === "POST" && query.route === "payment") {
        const { vk_id, package: pkg } = body;

        const packs = {
            starter: 15,
            basic: 50,
            pro: 150
        };

        if (!packs[pkg]) {
            return res.status(400).json({ error: "bad package" });
        }

        const user = await getUser(vk_id);

        await supabase
            .from("users")
            .update({ paid: user.paid + packs[pkg] })
            .eq("vk_id", vk_id);

        return res.json({ ok: true });
    }

    // =========================
    // USER
    // =========================
    if (method === "POST" && query.route === "user") {
        const { vk_id } = body;
        return res.json(await getUser(vk_id));
    }

    return res.status(404).json({ error: "not found" });
}