const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getProfile,
  uploadProfilePicture,
  removeProfilePicture,
  savePushToken,
  markNotificationRead,
} = require("../controllers/userController");
router.get("/me", auth, getProfile);

const { updateProfile } = require("../controllers/userController");
router.put("/me", auth, updateProfile);

router.post("/upload-profile-picture", auth, uploadProfilePicture);
router.delete("/profile-picture", auth, removeProfilePicture);
router.post("/push-token", auth, savePushToken);
router.post("/notifications/:id/read", auth, markNotificationRead);

module.exports = router;
