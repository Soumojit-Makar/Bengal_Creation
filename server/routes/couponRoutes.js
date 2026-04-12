const express = require("express");
const router = express.Router();
const { applyCoupon, getPublicCoupons } = require("../controllers/couponController");
const customerAuth = require("../middleware/customerAuth");

// Public coupons (for display on frontend)
router.get("/public", getPublicCoupons);

// Apply coupon at checkout (authenticated customer)
router.post("/apply", customerAuth, applyCoupon);

module.exports = router;
