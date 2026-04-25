let users = {}; // простая память (потом заменишь на БД)

export default async function handler(req, res) {
    const body = req.body;

    console.log("VK PAYMENT:", body);

    if (body.notification_type === "order_status_change") {

        const userId = body.user_id;
        const item = body.item;

        if (!users[userId]) {
            users[userId] = { gen: 0 };
        }

        if (item === "starter_pack") users[userId].gen += 15;
        if (item === "basic_pack") users[userId].gen += 50;
        if (item === "pro_pack") users[userId].gen += 150;

        console.log("Начислено:", users[userId]);
    }

    res.status(200).json({ ok: true });
}