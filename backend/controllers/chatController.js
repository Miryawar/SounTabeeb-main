const Message = require("../models/Message");
const Doctor = require("../models/Doctor");

exports.getMessages = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const messages = await Message.find({
      user: req.user._id,
      doctor: doctorId,
    }).sort("createdAt");
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    // Aggregate last message per doctor for this user, include doctor info
    const conversations = await Message.aggregate([
      { $match: { user: userId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$doctor",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          doctorId: "$_id",
          doctorName: "$doctor.name",
          lastMessage: {
            _id: "$lastMessage._id",
            text: "$lastMessage.text",
            senderRole: "$lastMessage.senderRole",
            createdAt: "$lastMessage.createdAt",
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]).exec();

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.createMessage = async (req, res) => {
  const { doctorId } = req.params;
  const { text, documentUrl, documentText } = req.body;

  if (!text && !documentUrl && !documentText)
    return res.status(400).json({ message: "Text or document required" });

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Save the user's message (text or a note about uploaded document)
    const userMessageText = text
      ? text
      : documentUrl
        ? `Uploaded document: ${documentUrl}`
        : "Uploaded document";

    const userMsg = new Message({
      user: req.user._id,
      doctor: doctorId,
      senderRole: req.user.role || "user",
      text: userMessageText,
    });
    await userMsg.save();

    // If there's a document or provided document text, attempt analysis
    let analysis = null;
    let docText = documentText || null;

    if (!docText && documentUrl) {
      try {
        const fetchFn = global.fetch || (await import("node-fetch")).default;
        const resp = await fetchFn(documentUrl);
        if (resp.ok) {
          const contentType =
            (resp.headers.get && resp.headers.get("content-type")) || "";
          if (contentType.includes("text") || contentType.includes("json")) {
            docText = await resp.text();
          } else if (
            contentType.includes("pdf") ||
            documentUrl.toLowerCase().endsWith(".pdf")
          ) {
            try {
              // try to use pdf-parse if available
              const buffer = Buffer.from(await resp.arrayBuffer());
              const pdfParse = require("pdf-parse");
              const parsed = await pdfParse(buffer);
              docText = parsed && parsed.text ? parsed.text : null;
            } catch (pdfErr) {
              console.warn(
                "pdf-parse not available or failed:",
                pdfErr.message || pdfErr,
              );
            }
          } else {
            // fallback to text
            try {
              docText = await resp.text();
            } catch (e) {
              docText = null;
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch document URL:", e.message || e);
      }
    }

    let aiAttempted = false;
    if (docText) {
      // call AI provider to analyze the extracted document text
      try {
        const ai = require("./aiChatController");
        if (ai && typeof ai.askProvider === "function") {
          aiAttempted = true;
          analysis = await ai.askProvider(
            `Analyze the following document and provide a concise summary and any important medical information or recommended next steps:\n\n${docText}`,
          );
        }
      } catch (e) {
        console.error("AI analysis error:", e.message || e);
      }
    }

    // If analysis exists, save it as a reply message (use 'doctor' role as assistant)
    let analysisMsg = null;
    if (analysis) {
      analysisMsg = new Message({
        user: req.user._id,
        doctor: doctorId,
        senderRole: "doctor",
        text: analysis,
      });
      await analysisMsg.save();
    }

    const aiUnavailable = aiAttempted && !analysis;
    if (aiUnavailable) {
      console.warn(
        "AI analysis unavailable for document; returning user message with no analysis",
      );
    }

    return res.json({
      userMessage: userMsg,
      analysisMessage: analysisMsg,
      aiUnavailable,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
