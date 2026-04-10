// const couponSchema = new mongoose.Schema({
//   code: { type: String, unique: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//   discount: Number, // e.g. 10 (% or fixed)
//   type: { type: String, enum: ["percent", "flat"] },

//   isUsed: { type: Boolean, default: false },
//   isActive: { type: Boolean, default: true },

//   expiresAt: Date,

//   createdAt: { type: Date, default: Date.now }
// });

import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    discount_type: {
      type: String,
      enum: ["PERCENTAGE", "FLAT"],
      required: true,
    },

    discount_value: {
      type: Number,
      required: true,
    },

    max_discount_amount: {
      type: Number,
      default: null,
    },

    min_order_amount: {
      type: Number,
      default: 0,
    },

    usage_limit: {
      type: Number,
      default: null, // null = unlimited
    },

    used_count: {
      type: Number,
      default: 0,
    },

    usage_limit_per_customer: {
      type: Number,
      default: 1,
    },

    start_at: {
      type: Date,
      required: true,
    },

    end_at: {
      type: Date,
      required: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    is_public: {
      type: Boolean,
      default: true,
    },

    applicable_for: {
      type: String,
      enum: ["ALL", "STORE", "CATEGORY", "FIRST_ORDER"],
      default: "ALL",
    },

    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// 🔥 Index for fast lookup
couponSchema.index({ code: 1 });

export default mongoose.model("Coupon", couponSchema);