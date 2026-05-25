exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
