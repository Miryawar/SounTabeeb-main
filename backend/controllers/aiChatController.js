const Doctor = require("../models/Doctor");

exports.handleAiChat = async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    const query = text.toLowerCase();

    // Basic symptom => speciality mapping
    const hints = [
      {
        keywords: ["fever", "cough", "cold", "flu", "headache"],
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
        speciality: "Pediatricians",
      },
      {
        keywords: ["headache", "migraine", "seizure", "nervous"],
        speciality: "Neurologist",
      },
    ];

    const matched = hints.find((hint) =>
      hint.keywords.some((keyword) => query.includes(keyword)),
    );

    const speciality = matched ? matched.speciality : "General physician";

    const doctors = await Doctor.find({ speciality: speciality })
      .limit(5)
      .select("name speciality fees experience profilePicture");

    const recommendations = doctors.map((doc) => ({
      _id: doc._id,
      name: doc.name,
      speciality: doc.speciality,
      fees: doc.fees,
      experience: doc.experience,
      profilePicture: doc.profilePicture,
    }));

    const answer = `Hi! Based on your symptoms, I recommend seeing a ${speciality}. Here are a few doctors you can book with:`;

    res.json({
      answer,
      recommendations,
      speciality,
      query: text,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
