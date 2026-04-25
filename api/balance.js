let users = {};

export default function handler(req, res) {
    const userId = req.query.user_id;

    if (!users[userId]) {
        users[userId] = { gen: 3 }; // бонус
    }

    res.status(200).json(users[userId]);
}