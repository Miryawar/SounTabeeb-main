const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  list,
  get,
  updateMe,
  getMyAppointments,
  getMyPatients,
  getMyEarnings,
  getPatientHistory,
} = require("../controllers/doctorController");

router.get("/", list);
router.get("/:id", get);
router.get("/me/appointments", auth, getMyAppointments);
router.get("/me/patients", auth, getMyPatients);
router.get("/me/earnings", auth, getMyEarnings);
router.get("/me/patients/:patientId/history", auth, getPatientHistory);
router.put("/me", auth, updateMe);

module.exports = router;
