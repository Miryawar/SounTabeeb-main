const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.post("/register", (req, res, next) => {
    console.log("REGISTER ROUTE HIT");
    next();
  }, register);

module.exports = router;
