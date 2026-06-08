const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  list,
  get,
  updateMe,
  getMyAppointments,
  getMyPatients,
} = require("../controllers/doctorController");

router.get("/", list);
router.get("/:id", get);
router.get("/me/appointments", auth, getMyAppointments);
router.get("/me/patients", auth, getMyPatients);
router.put("/me", auth, updateMe);

module.exports = router;
