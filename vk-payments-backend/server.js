import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

/*
  временная база
  позже можно заменить на Supabase / PostgreSQL
*/
const users = {};

/* ===== ROOT ===== */
app.get("/", (req, res) => {
  res.send("VK Payments backend работает 🚀");
});

/* ===== VK PAY WEBHOOK ===== */
app.post("/vk-payments", (req, res) => {
  try {
    const data = req.body;

    console.log("📩 VK PAYMENT:", JSON.stringify(data, null, 2));

    /*
      VK присылает событие успешной оплаты.
      Проверяем тип события.
    */
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

    res.status(200).send("ok");
  } catch (err) {
    console.error("❌ webhook error:", err);
    res.status(500).send("error");
  }
});

/* ===== USER CHECK ===== */
app.get("/user/:id", (req, res) => {
  try {
    const userId = req.params.id;

    const user = users[userId] || {
      premium: false
    };

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      premium: false
    });
  }
});

/* ===== HEALTH ===== */
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString()
  });
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});