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

  const generateContent = async () => {

    if (!topic) {
      setResult("Введите тему");
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
          topic,
          type,
          category
        })
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      setResult(data.result || "AI ничего не сгенерировал");

    } catch (error) {

      console.log("Ошибка:", error);
      setResult("Ошибка генерации. Сервер может спать (подожди 30 сек)");

    } finally {
      setLoading(false);
    }

  };

  // 🔥 УЛЬТРА PRO СТОРИС
  const shareToStory = async () => {

    if (!result) {
      alert("Сначала сгенерируй текст");
      return;
    }

    try {

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;

      const ctx = canvas.getContext("2d");

      // 🎨 фон
      if (styleType === "neon") {
        const g = ctx.createLinearGradient(0, 0, 1080, 1920);
        g.addColorStop(0, "#ff00cc");
        g.addColorStop(1, "#3333ff");
        ctx.fillStyle = g;
      } else if (styleType === "business") {
        ctx.fillStyle = "#0f2027";
      } else {
        ctx.fillStyle = "#000000";
      }

      ctx.fillRect(0, 0, 1080, 1920);

      // затемнение
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(50, 250, 980, 1000);

      // текст
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px Arial";

      const text = result.slice(0, 220);
      const words = text.split(" ");

      let line = "";
      let y = 350;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const width = ctx.measureText(testLine).width;

        if (width > 900) {
          ctx.fillText(line, 90, y);
          line = words[i] + " ";
          y += 90;
        } else {
          line = testLine;
        }
      }

      ctx.fillText(line, 90, y);

      // бренд
      ctx.font = "40px Arial";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText("⚡ AI POST GENERATOR", 90, 1700);

      // blob
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
    }

  };

  return (

    <div style={{ padding: 20, fontFamily: "Arial" }}>

      <h1>AI генератор постов</h1>

      {user && <p>Привет, {user.first_name}</p>}

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ padding: 10, width: "100%", marginBottom: 10 }}
      >
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
        style={{ padding: 10, width: "100%", marginBottom: 10 }}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ padding: 10, width: "100%", marginBottom: 10 }}
      >
        <option value="post">Пост</option>
        <option value="ideas">Идеи постов</option>
        <option value="hashtags">Хэштеги</option>
        <option value="ads">Реклама</option>
      </select>

      {/* 🎨 выбор дизайна */}
      <select
        value={styleType}
        onChange={(e) => setStyleType(e.target.value)}
        style={{ padding: 10, width: "100%", marginBottom: 10 }}
      >
        <option value="neon">🔥 Неон</option>
        <option value="business">💼 Бизнес</option>
        <option value="dark">🌑 Тёмный</option>
      </select>

      <button
        onClick={generateContent}
        disabled={loading}
        style={{
          padding: 12,
          width: "100%",
          background: "#0077ff",
          color: "white",
          border: "none",
          marginBottom: 20,
          cursor: "pointer",
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? "⏳ Генерация..." : "Сгенерировать"}
      </button>

      <div
        style={{
          background: "#f3f3f3",
          padding: 15,
          borderRadius: 10,
          minHeight: 80,
          whiteSpace: "pre-wrap"
        }}
      >
        {result}
      </div>

      <button
        onClick={() => navigator.clipboard.writeText(result)}
        style={{
          marginTop: 10,
          padding: 10,
          width: "100%"
        }}
      >
        📋 Скопировать
      </button>

      <button
        onClick={shareToStory}
        style={{
          marginTop: 10,
          padding: 12,
          width: "100%",
          background: "#4caf50",
          color: "white",
          border: "none"
        }}
      >
        📲 Поделиться в сторис PRO
      </button>

    </div>

  );

};