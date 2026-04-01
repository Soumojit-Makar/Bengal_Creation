const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/mail-sender");
const Token = require("../models/Token");
const { v4: uuidv4 } = require("uuid");

const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    let user = await Customer.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email exists" });
    const hashed = await bcrypt.hash(password, 10);
    user = new Customer({ name, email, phone, password: hashed });
    await user.save();
    res.json({ msg: "Customer Registered", user });
  } catch (err) {
    res.status(500).json({ msg: "error", error: err.message });
  }
};

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  const user = await Customer.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid email" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ msg: "Wrong password" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await Customer.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid email" });

  // Delete any old tokens for this user
  await Token.deleteMany({ userId: user._id });

  const token = uuidv4();
  await Token.create({ userId: user._id, token });

  await sendEmail(
    user.email,
    "Password Reset Request",
    `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <div style="background: #ff4d4d; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">🔐 Password Reset</h2>
      </div>
      <div style="padding: 20px; color: #333;">
        <p style="font-size: 16px;">Hi <b>${user.name}</b>,</p>
        <p style="font-size: 15px;">We received a request to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}" 
             style="background: #ff4d4d; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #555;">If you did not request this, you can safely ignore this email.</p>
        <p style="font-size: 14px; color: #555;">This link will expire soon for security reasons.</p>
      </div>
      <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Bengal Creations. All rights reserved.
      </div>
    </div>
  </div>
  `
  );
  res.json({ msg: "Password reset email sent" });
};

const resetPassword = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { token, newPassword } = req.body;

    if (!customerId || !token || !newPassword) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const user = await Customer.findById(customerId);
    if (!user) return res.status(400).json({ msg: "Invalid user" });

    const tokenDoc = await Token.findOne({ userId: customerId, token });
    if (!tokenDoc) return res.status(400).json({ msg: "Invalid or expired token" });

    await Token.deleteOne({ _id: tokenDoc._id });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ msg: "Password has been reset" });
  } catch (err) {
    res.status(500).json({ msg: "error", error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { customerId, currentPassword, newPassword } = req.body;
    const user = await Customer.findById(customerId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ msg: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "error", error: err.message });
  }
};

module.exports = { registerCustomer, loginCustomer, forgotPassword, resetPassword, changePassword };
