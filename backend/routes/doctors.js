const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { list, get, updateMe } = require("../controllers/doctorController");

router.get("/", list);
router.get("/:id", get);
router.put("/me", auth, updateMe);

module.exports = router;
