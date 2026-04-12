const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: { type: String, required: true },
    description: String,
    discount_type: {
      type: String,
      enum: ["PERCENTAGE", "FLAT"],
      required: true,
    },
    discount_value: { type: Number, required: true },
    max_discount_amount: { type: Number, default: null },
    min_order_amount: { type: Number, default: 0 },
    usage_limit: { type: Number, default: null },
    used_count: { type: Number, default: 0 },
    usage_limit_per_customer: { type: Number, default: 1 },
    start_at: { type: Date, required: true },
    end_at: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
    is_public: { type: Boolean, default: true },
    applicable_for: {
      type: String,
      enum: ["ALL", "STORE", "CATEGORY", "FIRST_ORDER"],
      default: "ALL",
    },
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

couponSchema.index({ code: 1 });
couponSchema.index({ is_active: 1, end_at: 1 });

module.exports =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
