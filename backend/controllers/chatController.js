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
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text required" });
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const msg = new Message({
      user: req.user._id,
      doctor: doctorId,
      senderRole: req.user.role || "user",
      text,
    });
    await msg.save();
    res.json(msg);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
