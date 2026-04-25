const express = require("express");
const app = express();

app.use(express.json());

const users = {}; // временная база

// VK Payments webhook
app.post("/vk-payments", (req, res) => {
  const data = req.body;

  console.log("📩 VK PAYMENT:", data);

  // 🔥 VK событие оплаты
  if (data?.type === "order_success") {

    const userId = data?.user_id;

    if (userId) {
      users[userId] = {
        premium: true,
        paidAt: Date.now()
      };

      console.log("💎 PREMIUM выдан пользователю:", userId);
    }
  }

  res.send("ok");
});

// проверка сервера
app.get("/", (req, res) => {
  res.send("VK Payments backend работает 🚀");
});

// проверка пользователя
app.get("/user/:id", (req, res) => {
  const user = users[req.params.id] || { premium: false };
  res.json(user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started:", PORT);
});