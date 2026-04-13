const mongoose = require("mongoose");

// Singleton document — only one row ever exists, identified by key="global"
const platformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },

    // GST / Tax
    gstRate: { type: Number, default: 5 },           // percentage, e.g. 5 → 5%
    gstEnabled: { type: Boolean, default: true },

    // Platform / Commission charge
    platformFeeRate: { type: Number, default: 0 },   // % taken from order subtotal
    platformFeeEnabled: { type: Boolean, default: false },
    platformFeeLabel: { type: String, default: "Platform Fee" },

    // Delivery charge
    deliveryCharge: { type: Number, default: 0 },    // flat ₹
    deliveryChargeEnabled: { type: Boolean, default: false },
    freeDeliveryAbove: { type: Number, default: 0 }, // 0 = no free threshold

    // Coupon / discount cap (global max discount %)
    maxCouponDiscountPct: { type: Number, default: 100 },

    // Additional admin notes / announcements
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PlatformSettings ||
  mongoose.model("PlatformSettings", platformSettingsSchema);
