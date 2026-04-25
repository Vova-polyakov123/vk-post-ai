import { useState, useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";

export const App = () => {

  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [type, setType] = useState("post");
  const [category, setCategory] = useState("business");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [styleType, setStyleType] = useState("neon");

  useEffect(() => {
    bridge.send("VKWebAppInit");

    async function getUser() {
      try {
        const data = await bridge.send("VKWebAppGetUserInfo");
        setUser(data);
      } catch (e) {
        console.log(e);
      }
    }

    getUser();
  }, []);

  // 🔥 ГЕНЕРАЦИЯ (ИСПРАВЛЕНО ПОЛНОСТЬЮ)
  const generateContent = async () => {

    const cleanTopic = topic.trim();

    if (!cleanTopic) {
      setResult("❌ Введите тему");
      return;
    }

    setLoading(true);
    setResult("⏳ Генерация...");

    try {

      const response = await fetch("https://vk-post-ai.onrender.com/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: cleanTopic,
          type,
          category
        })
      });

      const data = await response.json();

      console.log("SERVER RESPONSE:", data);

      // 🔥 ВАЖНО: поддержка разных ответов
      setResult(
        data.result ||
        data.text ||
        data.error ||
        JSON.stringify(data) ||
        "❌ Пустой ответ"
      );

    } catch (error) {

      console.log("Ошибка:", error);
      setResult("❌ Ошибка сети / сервер не отвечает");

    } finally {
      setLoading(false);
    }

  };

  // 🔥 СТОРИС (ИСПРАВЛЕНО)
  const shareToStory = async () => {

    if (!result || result.includes("⏳")) {
      alert("Сначала сгенерируй текст");
      return;
    }

    try {

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;

      const ctx = canvas.getContext("2d");

      // фон
      if (styleType === "neon") {
        const g = ctx.createLinearGradient(0, 0, 1080, 1920);
        g.addColorStop(0, "#ff00cc");
        g.addColorStop(1, "#3333ff");
        ctx.fillStyle = g;
      } else if (styleType === "business") {
        ctx.fillStyle = "#0f2027";
      } else {
        ctx.fillStyle = "#000";
      }

      ctx.fillRect(0, 0, 1080, 1920);

      // текст блок
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(80, 250, 920, 1000);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 60px Arial";

      const words = result.slice(0, 200).split(" ");

      let line = "";
      let y = 350;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const width = ctx.measureText(testLine).width;

        if (width > 850) {
          ctx.fillText(line, 100, y);
          line = words[i] + " ";
          y += 80;
        } else {
          line = testLine;
        }
      }

      ctx.fillText(line, 100, y);

      ctx.font = "40px Arial";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText("AI POST GENERATOR", 100, 1750);

      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/png")
      );

      const reader = new FileReader();

      reader.onloadend = async () => {
        await bridge.send("VKWebAppShowStoryBox", {
          background_type: "image",
          blob: reader.result
        });
      };

      reader.readAsDataURL(blob);

    } catch (e) {
      console.log("Ошибка сторис:", e);
      alert("Ошибка сторис");
    }

  };

  return (

    <div style={{ padding: 20, fontFamily: "Arial" }}>

      <h1>AI генератор постов</h1>

      {user && <p>Привет, {user.first_name}</p>}

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="business">Бизнес</option>
        <option value="humor">Юмор</option>
        <option value="news">Новости</option>
        <option value="motivation">Мотивация</option>
        <option value="tech">Технологии</option>
      </select>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Введите тему"
        style={{ width: "100%", marginTop: 10 }}
      />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="post">Пост</option>
        <option value="ideas">Идеи</option>
        <option value="hashtags">Хэштеги</option>
        <option value="ads">Реклама</option>
      </select>

      <select value={styleType} onChange={(e) => setStyleType(e.target.value)}>
        <option value="neon">Неон</option>
        <option value="business">Бизнес</option>
        <option value="dark">Тёмный</option>
      </select>

      <button
        onClick={generateContent}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 12,
          background: "#0077ff",
          color: "white",
          border: "none"
        }}
      >
        {loading ? "⏳ Генерация..." : "Сгенерировать"}
      </button>

      <div style={{
        marginTop: 15,
        background: "#f3f3f3",
        padding: 10,
        borderRadius: 10,
        minHeight: 80
      }}>
        {result}
      </div>

      <button
        onClick={() => navigator.clipboard.writeText(result)}
        style={{ width: "100%", marginTop: 10 }}
      >
        Копировать
      </button>

      <button
        onClick={shareToStory}
        style={{
          width: "100%",
          marginTop: 10,
          background: "#4caf50",
          color: "white",
          padding: 12,
          border: "none"
        }}
      >
        В сторис
      </button>

    </div>
  );
};