const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    isVerified: { type: Boolean, default: true },
    googleId: { type: String, default: null },
    picture: { type: String, default: null },
    hasOrdered: { type: Boolean, default: false }
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
