const express = require("express");
const router = express.Router();
const { list, get } = require("../controllers/doctorController");

router.get("/", list);
router.get("/:id", get);

module.exports = router;
