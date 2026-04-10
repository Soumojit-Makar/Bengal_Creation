const express = require("express");
const router = express.Router();
const { generateCoupon } = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/generate", authMiddleware, generateCoupon);

module.exports = router;