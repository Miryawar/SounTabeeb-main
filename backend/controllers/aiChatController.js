const Doctor = require("../models/Doctor");

const AI_PROVIDER = process.env.AI_PROVIDER?.trim().toLowerCase() || "openai";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim() || null;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY?.trim() || null;
const GOOGLE_GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL || "gemini-1.0";

const specialityHints = [
  {
    keywords: ["fever", "cough", "cold", "flu", "headache", "body ache"],
    speciality: "General physician",
  },
  {
    keywords: ["stomach", "gastric", "digestion", "ulcer", "constipation"],
    speciality: "Gastroenterologist",
  },
  {
    keywords: ["skin", "acne", "rash", "eczema", "psoriasis"],
    speciality: "Dermatologist",
  },
  {
    keywords: ["pregnancy", "period", "gynecologist", "women"],
    speciality: "Gynecologist",
  },
  {
    keywords: ["child", "kids", "pediatric", "vaccination"],
    speciality: "Pediatrician",
  },
  {
    keywords: ["headache", "migraine", "seizure", "nervous"],
    speciality: "Neurologist",
  },
  {
    keywords: ["teeth", "dental", "gum", "toothache"],
    speciality: "Dentist",
  },
];

const fetchFn =
  typeof fetch !== "undefined"
    ? fetch.bind(global)
    : (...args) =>
        import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function askOpenAI(question) {
  if (!OPENAI_API_KEY) {
    console.warn("OpenAI provider skipped: OPENAI_API_KEY is not configured.");
    return null;
  }

  const url = "https://api.openai.com/v1/chat/completions";
  const messages = [
    {
      role: "system",
      content:
        "You are a friendly medical assistant for a healthcare booking app. Answer the user's health questions directly and clearly. Avoid recommending specific doctors unless the user explicitly asks for a doctor recommendation or asks how to book an appointment.",
    },
    {
      role: "user",
      content: question,
    },
  ];

  const response = await fetchFn(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 500,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("OpenAI provider response error", response.status, data);
    return null;
  }

  return data?.choices?.[0]?.message?.content?.trim() || null;
}

async function askGemini(question) {
  if (!GOOGLE_API_KEY) {
    console.warn("Gemini provider skipped: GOOGLE_API_KEY is not configured.");
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta2/models/${GOOGLE_GEMINI_MODEL}:generate?key=${GOOGLE_API_KEY}`;
  const response = await fetchFn(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: {
        text:
          "You are a friendly medical assistant for a healthcare booking app. Answer the user's health questions directly and clearly. Avoid recommending specific doctors unless the user explicitly asks for a doctor recommendation or asks how to book an appointment.\n\nUser question: " +
          question,
      },
      temperature: 0.5,
      maxOutputTokens: 500,
      topP: 0.95,
      candidateCount: 1,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Gemini provider response error", response.status, data);
    return null;
  }

  return data?.candidates?.[0]?.output?.trim() || null;
}

async function askProvider(question) {
  if (AI_PROVIDER === "gemini") {
    const geminiAnswer = await askGemini(question);
    if (geminiAnswer) {
      return geminiAnswer;
    }
    if (OPENAI_API_KEY) {
      console.warn("Gemini unavailable, falling back to OpenAI.");
      return await askOpenAI(question);
    }
    return null;
  }

  const openAiAnswer = await askOpenAI(question);
  if (openAiAnswer) {
    return openAiAnswer;
  }
  if (GOOGLE_API_KEY) {
    console.warn("OpenAI unavailable, falling back to Gemini.");
    return await askGemini(question);
  }
  return null;
}

function providerKeyAvailable() {
  return AI_PROVIDER === "gemini" ? !!GOOGLE_API_KEY : !!OPENAI_API_KEY;
}

function localAnswer(query) {
  const lower = query.toLowerCase();

  if (lower.includes("headache") || lower.includes("migraine")) {
    return "Headaches can be caused by stress, dehydration, or lack of sleep. Try resting in a quiet, dark room, drinking water, and applying a cool compress. If your headache is severe, sudden, or accompanied by vision changes, fever, or confusion, seek medical care right away.";
  }

  if (
    lower.includes("fever") ||
    lower.includes("temperature") ||
    lower.includes("hot")
  ) {
    return "A mild fever is often a sign your body is fighting infection. Stay hydrated, rest, and take paracetamol or ibuprofen if needed. If your fever stays above 39°C (102°F), lasts more than 3 days, or is accompanied by severe symptoms, contact a doctor.";
  }

  if (
    lower.includes("cough") ||
    lower.includes("cold") ||
    lower.includes("sore throat") ||
    lower.includes("flu")
  ) {
    return "For coughs and colds, rest, fluids, throat lozenges, and steam inhalation can help. Monitor for difficulty breathing, chest pain, or high fever. If symptoms worsen or last more than a week, see a healthcare provider.";
  }

  if (
    lower.includes("stomach") ||
    lower.includes("gastric") ||
    lower.includes("digestion") ||
    lower.includes("ulcer") ||
    lower.includes("constipation")
  ) {
    return "Stomach discomfort can come from diet, stress, or infection. Drink plenty of water, avoid spicy or oily foods, and eat light meals. If you have persistent pain, blood in stools, or vomiting, consult a doctor.";
  }

  if (
    lower.includes("skin") ||
    lower.includes("acne") ||
    lower.includes("rash") ||
    lower.includes("eczema") ||
    lower.includes("psoriasis")
  ) {
    return "Skin issues often respond to gentle skincare, avoiding irritants, and keeping the area clean. Use a mild, fragrance-free moisturizer and protect sensitive skin from harsh chemicals. If your rash is spreading, painful, or blistering, get medical advice.";
  }

  if (
    lower.includes("pregnancy") ||
    lower.includes("period") ||
    lower.includes("gynecologist") ||
    lower.includes("women's health") ||
    lower.includes("women health")
  ) {
    return "For pregnancy and gynecological concerns, it is best to consult a qualified specialist. They can provide personalized care based on your symptoms, cycle, and health history.";
  }

  if (
    lower.includes("child") ||
    lower.includes("kids") ||
    lower.includes("pediatric") ||
    lower.includes("vaccination")
  ) {
    return "Children often need assessment from a pediatrician for fever, cough, or behavioral changes. Keep them hydrated and monitor symptoms closely. If they develop difficulty breathing, a high fever, or unusual drowsiness, seek care immediately.";
  }

  if (
    lower.includes("injury") ||
    lower.includes("sprain") ||
    lower.includes("fracture") ||
    lower.includes("cut") ||
    lower.includes("bleeding")
  ) {
    return "For an injury, clean and protect the area, rest, and apply ice if there is swelling. If there is severe pain, inability to move the limb, or heavy bleeding, seek emergency medical attention.";
  }

  if (
    lower.includes("may i") ||
    lower.includes("can i") ||
    lower.includes("should i") ||
    lower.includes("is it safe") ||
    lower.includes("is it okay")
  ) {
    return (
      `I can't give medical advice, but for your question: "${query}", the safest step is to avoid anything that makes your symptoms worse and speak with a healthcare professional if you are unsure. ` +
      `If you'd like, describe the exact symptom, duration, and whether it changed after any medication or activity.`
    );
  }

  if (
    lower.includes("what") ||
    lower.includes("how") ||
    lower.includes("why") ||
    lower.includes("symptoms") ||
    lower.includes("should") ||
    lower.includes("is")
  ) {
    return (
      `For your question about "${query}", here is some general guidance: ` +
      `Use rest, hydration, and gentle self-care while you monitor how the symptom changes. ` +
      `If anything becomes severe, sudden, or worrying, contact a doctor right away.`
    );
  }

  if (query.trim().length > 0) {
    return (
      `I don't have access to the AI assistant right now, but regarding "${query}", I can offer general health guidance. ` +
      `If your symptoms include pain, fever, breathing issues, or sudden changes, seek a medical opinion promptly.`
    );
  }

  return "I'm not a doctor, but I can provide general guidance. Please describe your symptoms or ask a health-related question, and I will do my best to help.";
}

function detectSpeciality(query) {
  const lower = query.toLowerCase();
  const matched = specialityHints.find((hint) =>
    hint.keywords.some((keyword) => lower.includes(keyword)),
  );
  return matched ? matched.speciality : "General physician";
}

function shouldRecommendDoctors(query) {
  const lower = query.toLowerCase();
  const doctorTriggers = [
    "recommend a doctor",
    "which doctor",
    "which specialist",
    "book appointment",
    "find a doctor",
    "need a doctor",
    "see a doctor",
    "doctor recommendation",
    "specialist recommendation",
    "clinic",
    "appointment",
  ];
  return doctorTriggers.some((trigger) => lower.includes(trigger));
}

async function findDoctors(speciality) {
  let doctors = await Doctor.find({
    speciality: { $regex: speciality, $options: "i" },
  })
    .limit(5)
    .select("name speciality fees experience profilePicture");

  if (!doctors.length) {
    doctors = await Doctor.find()
      .limit(5)
      .select("name speciality fees experience profilePicture");
  }

  return doctors.map((doc) => ({
    _id: doc._id,
    name: doc.name,
    speciality: doc.speciality || "General physician",
    fees: doc.fees,
    experience: doc.experience,
    profilePicture: doc.profilePicture,
    available: true,
  }));
}

const GENERIC_LOCAL_FALLBACK =
  "I'm not a doctor, but I can provide general guidance. Please describe your symptoms or ask a health-related question, and I will do my best to help.";

function permissionFallback(query) {
  const lower = (query || "").toLowerCase();
  if (
    lower.includes("may i") ||
    lower.includes("can i") ||
    lower.includes("should i") ||
    lower.includes("is it safe") ||
    lower.includes("is it okay")
  ) {
    return (
      "I can't provide medical advice, but if you're asking whether a mild symptom is normal, the safest step is to avoid anything that worsens the pain or discomfort, and contact a doctor if you are unsure. " +
      "If you'd like, describe the symptom or situation and I can share general guidance."
    );
  }
  return GENERIC_LOCAL_FALLBACK;
}

function generativeFallback(query) {
  const safeQuery = (query || "").trim();
  const summary =
    safeQuery.length > 120 ? safeQuery.slice(0, 117) + "..." : safeQuery;

  const suggestions = [
    "Rest and avoid strenuous activity.",
    "Stay hydrated and eat light, bland foods if nausea is present.",
    "Use over-the-counter medicines like paracetamol for fever or aches if appropriate and you have no contraindications.",
    "Monitor your symptoms closely: note when they started, how they changed, and any red flags (difficulty breathing, severe pain, confusion, high fever).",
  ];

  return (
    `The AI assistant is currently unavailable, but regarding: "${summary}", here are some general suggestions:\n- ${suggestions.join("\n- ")}\n` +
    `If symptoms are severe, sudden, or worsening, seek immediate medical care. For personalised advice, consult a licensed healthcare professional.`
  );
}

function noProviderFallback(query) {
  const safeQuery = (query || "").trim();
  return (
    `I don\'t currently have access to the AI assistant, but I can still offer general guidance. ` +
    `For your question: "${safeQuery}", try to include symptoms, how long they started, and whether they are getting better or worse. ` +
    `If you are unsure or the issue is urgent, seek advice from a licensed healthcare provider.`
  );
}

exports.handleAiChat = async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    const speciality = detectSpeciality(text);
    let answer = null;
    let recommendations = [];
    let providerAttempted = false;
    let providerUsed = null;

    if (providerKeyAvailable()) {
      providerAttempted = true;
      providerUsed = AI_PROVIDER;
      try {
        answer = await askProvider(text);
      } catch (providerError) {
        console.error("AI provider error", providerError);
      }
    } else if (OPENAI_API_KEY || GOOGLE_API_KEY) {
      providerAttempted = true;
      if (OPENAI_API_KEY) {
        providerUsed = "openai";
        try {
          answer = await askOpenAI(text);
        } catch (providerError) {
          console.error("OpenAI provider error", providerError);
        }
      } else if (GOOGLE_API_KEY) {
        providerUsed = "gemini";
        try {
          answer = await askGemini(text);
        } catch (providerError) {
          console.error("Gemini provider error", providerError);
        }
      }
    }

    if (!answer) {
      answer = localAnswer(text);
    }

    if (answer === GENERIC_LOCAL_FALLBACK) {
      answer = providerAttempted
        ? generativeFallback(text)
        : noProviderFallback(text);
    }

    if (shouldRecommendDoctors(text)) {
      recommendations = await findDoctors(speciality);
    }

    return res.json({
      answer,
      recommendations,
      speciality,
      query: text,
      providerAttempted,
      providerUsed,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
