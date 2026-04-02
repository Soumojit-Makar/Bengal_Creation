const { OAuth2Client } = require("google-auth-library");
const Customer = require("../models/Customer");
const Vendor = require("../models/vendor");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Customer Google Login ─────────────────────────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ msg: "Google credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await Customer.findOne({ email });

    if (!user) {
      user = new Customer({
        name,
        email,
        password: `google_oauth_${googleId}`,
        phone: "",
        isVerified: true,
        googleId,
        picture,
      });
      await user.save();
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error("Google auth error (customer):", err.message);
    res.status(401).json({ msg: "Google authentication failed", error: err.message });
  }
};

// ── Vendor Google Login ───────────────────────────────────────────────────────
const vendorGoogleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ msg: "Google credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.status(404).json({
        msg: "No vendor account found with this Google email. Please register first or use email/password login.",
        notFound: true,
      });
    }

    if (!vendor.isVerified) {
      return res.status(403).json({
        msg: "Your vendor account is pending approval. Please wait for admin verification.",
      });
    }

    if (!vendor.googleId) {
      vendor.googleId = googleId;
      vendor.picture = picture;
      await vendor.save();
    }

    const token = jwt.sign(
      {
        id: vendor._id,
        vendorId: vendor.vendorId,
        email: vendor.email,
        role: "vendor",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeVendor = vendor.toObject();
    delete safeVendor.password;

    res.json({ token, vendor: safeVendor });
  } catch (err) {
    console.error("Google auth error (vendor):", err.message);
    res.status(401).json({ msg: "Google authentication failed", error: err.message });
  }
};

module.exports = { googleLogin, vendorGoogleLogin };
