import { createRoot } from "react-dom/client";
import bridge from "@vkontakte/vk-bridge";
import { AppConfig } from "./AppConfig.js";

bridge.send("VKWebAppInit");

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<AppConfig />);
}

// подключаем eruda только в режиме разработки
if (import.meta.env.DEV) {
  import("./eruda.js");
}