const Coupon = require("../models/coupon");
const Customer = require("../models/Customer");
const Order = require("../models/order");

// ── Apply / Validate coupon (called at checkout) ──────────────────────────────
const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal, customerId } = req.body;

    if (!code || !cartTotal)
      return res.status(400).json({ msg: "code and cartTotal required" });

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      is_active: true,
    });

    if (!coupon) return res.status(404).json({ msg: "Invalid coupon code" });

    const now = new Date();
    if (now < coupon.start_at)
      return res.status(400).json({ msg: "Coupon is not active yet" });
    if (now > coupon.end_at)
      return res.status(400).json({ msg: "Coupon has expired" });

    if (cartTotal < coupon.min_order_amount) {
      return res.status(400).json({
        msg: `Minimum order amount is ₹${coupon.min_order_amount}`,
      });
    }

    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ msg: "Coupon usage limit reached" });
    }

    // Per-customer usage check
    if (customerId && coupon.usage_limit_per_customer) {
      const usedByCustomer = await Order.countDocuments({
        user: customerId,
        couponCode: coupon.code,
        paymentStatus: "Paid",
      });
      if (usedByCustomer >= coupon.usage_limit_per_customer) {
        return res
          .status(400)
          .json({ msg: "You have already used this coupon" });
      }
    }

    // First order check
    if (coupon.applicable_for === "FIRST_ORDER" && customerId) {
      const customer = await Customer.findById(customerId);
      if (customer?.hasOrdered) {
        return res
          .status(400)
          .json({ msg: "This coupon is only for first-time orders" });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "PERCENTAGE") {
      discountAmount = (cartTotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    discountAmount = Math.min(discountAmount, cartTotal);
    discountAmount = Math.round(discountAmount);

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discountAmount,
      finalTotal: cartTotal - discountAmount,
    });
  } catch (err) {
    console.error("applyCoupon error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ── Get all public active coupons (for customers) ─────────────────────────────
const getPublicCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      is_active: true,
      is_public: true,
      end_at: { $gte: new Date() },
      start_at: { $lte: new Date() },
    }).select("-store_id -category_id -used_count");
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ── Increment used_count after successful order ───────────────────────────────
const incrementUsage = async (code) => {
  await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { $inc: { used_count: 1 } }
  );
};

module.exports = { applyCoupon, getPublicCoupons, incrementUsage };
