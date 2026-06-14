const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const fetchFn =
  typeof fetch !== "undefined"
    ? fetch.bind(global)
    : (...args) =>
        import("node-fetch").then(({ default: fetch }) => fetch(...args));

(async () => {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
  const googleKey = process.env.GOOGLE_API_KEY;
  const googleModel = process.env.GOOGLE_GEMINI_MODEL || "gemini-1.0";

  if (openaiKey) {
    try {
      const res = await fetchFn("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + openaiKey,
        },
        body: JSON.stringify({
          model: openaiModel,
          messages: [{ role: "user", content: "Say hi." }],
          max_tokens: 5,
        }),
      });

      console.log("openai_status", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("openai_ok:true");
      } else {
        const text = await res.text();
        console.error("openai_error", res.status, text.slice(0, 1000));
      }
    } catch (e) {
      console.error("openai_exception", e.message || e);
    }
  } else {
    console.log("openai_missing");
  }

  if (googleKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta2/models/${googleModel}:generate?key=${googleKey}`;
      const res = await fetchFn(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { text: "Say hi." },
          maxOutputTokens: 5,
        }),
      });

      console.log("gemini_status", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("gemini_ok:true");
      } else {
        const text = await res.text();
        console.error("gemini_error", res.status, text.slice(0, 1000));
      }
    } catch (e) {
      console.error("gemini_exception", e.message || e);
    }
  } else {
    console.log("gemini_missing");
  }
})();
