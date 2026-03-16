import { useState, useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";

export const App = () => {

  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [type, setType] = useState("post");
  const [category, setCategory] = useState("business");
  const [user, setUser] = useState(null);

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

    try {

      const response = await fetch("https://vk-post-ai.onrender.com", {
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

      const data = await response.json();

      setResult(data.result);

    } catch (error) {

      console.log("Ошибка:", error);
      setResult("Ошибка генерации");

    }

  };

  return (

    <div style={{ padding: 20, fontFamily: "Arial" }}>

      <h1>AI генератор постов</h1>

      {user && <p>Привет, {user.first_name}</p>}

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          marginBottom: 10
        }}
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
        style={{
          padding: 10,
          width: "100%",
          marginBottom: 10
        }}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          marginBottom: 10
        }}
      >

        <option value="post">Пост</option>
        <option value="ideas">Идеи постов</option>
        <option value="hashtags">Хэштеги</option>
        <option value="ads">Реклама</option>

      </select>

      <button
        onClick={generateContent}
        style={{
          padding: 12,
          width: "100%",
          background: "#0077ff",
          color: "white",
          border: "none",
          marginBottom: 20,
          cursor: "pointer"
        }}
      >

        Сгенерировать

      </button>

      <div
        style={{
          background: "#f3f3f3",
          padding: 15,
          borderRadius: 10,
          minHeight: 80
        }}
      >

        {result}

      </div>

    </div>

  );

};