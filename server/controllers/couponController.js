const Coupon = require("../models/coupon");
const Customer = require("../models/Customer");

const generateCoupon = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await Customer.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // ❌ already ordered
    if (user.hasOrdered) {
      return res.status(400).json({ msg: "Only for first order users" });
    }

    // ❌ already has active coupon
    const existing = await Coupon.findOne({ userId, isActive: true });
    if (existing) {
      return res.json(existing);
    }

    // ✅ generate unique code
    const code =
      "FIRST" +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const coupon = await Coupon.create({
      code,
      userId,
      discount: 20,
      type: "percent",
      isActive: true,
      isUsed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.json(coupon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { generateCoupon };