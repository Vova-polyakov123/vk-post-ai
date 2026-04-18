import bridge from "https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js";

let user = null;

async function initApp() {
  try {
    // 🔥 ОБЯЗАТЕЛЬНО ПЕРВОЕ
    await bridge.send("VKWebAppInit");

    console.log("VK INIT OK");

    // 👤 получаем юзера
    user = await bridge.send("VKWebAppGetUserInfo");

    console.log("USER:", user);

    // отправляем на сервер
    await fetch("https://your-api.com/user/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id
      })
    });

  } catch (e) {
    console.error("INIT ERROR:", e);

    alert("Открой приложение через VK!");
  }
}

initApp();


// ============================
// 🔥 ГЕНЕРАЦИЯ
// ============================

document.getElementById("generateBtn").onclick = async () => {
  try {
    const res = await fetch("https://your-api.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        prompt: "Напиши пост про бизнес"
      })
    });

    const data = await res.json();

    document.getElementById("result").innerText = data.text;

  } catch (e) {
    console.error(e);
  }
};


// ============================
// 💳 ОПЛАТА
// ============================

document.getElementById("buyBtn").onclick = async () => {
  try {
    await bridge.send("VKWebAppOpenPayForm", {
      app_id: YOUR_APP_ID,
      action: "pay-to-service",
      params: {
        amount: 9900,
        description: "PRO пакет",
        user_id: user.id
      }
    });

  } catch (e) {
    console.error(e);
  }
};