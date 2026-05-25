const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  create,
  listForUser,
  cancel,
} = require("../controllers/appointmentController");

router.post("/", auth, create);
router.get("/", auth, listForUser);
router.post("/:id/cancel", auth, cancel);

module.exports = router;
