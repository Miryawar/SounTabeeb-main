const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const fetchFn =
  typeof fetch !== "undefined"
    ? fetch.bind(global)
    : (...args) =>
        import("node-fetch").then(({ default: fetch }) => fetch(...args));

const key = process.env.GOOGLE_API_KEY;
const model = process.env.GOOGLE_GEMINI_MODEL || "gemini-2.5-pro";
const alternateModel = "gemini-2.5-flash";

async function testUrl(url) {
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: { text: "Hello" }, maxOutputTokens: 5 }),
    });
    const text = await res.text();
    console.log("URL:", url);
    console.log("Status:", res.status);
    console.log("Body:", text);
    return res.status;
  } catch (err) {
    console.error("Error fetching", url, err.message || err);
    return null;
  }
}

(async () => {
  if (!key) {
    console.error("GOOGLE_API_KEY is missing in backend/.env");
    process.exit(1);
  }

  await testUrl(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`,
  );
  await testUrl(
    `https://generativelanguage.googleapis.com/v1/models/${alternateModel}:generateContent?key=${key}`,
  );
})();
