const mongoose = require("mongoose");

const superAdminOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

superAdminOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports =
  mongoose.models.SuperAdminOtp ||
  mongoose.model("SuperAdminOtp", superAdminOtpSchema);
