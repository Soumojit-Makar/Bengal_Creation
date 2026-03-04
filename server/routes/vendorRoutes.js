// routes/vendorRoutes.js
const express = require("express");
const router = express.Router();
const Vendor = require("../models/vendor");
const Product = require("../models/product");
const {cloudinaryUpload,cloudinaryDirect} = require("../middleware/upload");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const uploadImage = require("../middleware/cloudinary");
const jwt = require("jsonwebtoken");

// REGISTER VENDOR WITH 3 MANDATORY DOCUMENTS

router.post(
  "/register",
  cloudinaryUpload.fields([
    { name: "tradeLicense", maxCount: 1 },
    { name: "aadhaarCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "otherDoc", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("Files received:", req.files ? Object.keys(req.files) : "No files");
      console.log("Cloudinary files:", req.cloudinaryFiles);

      // Check mandatory docs
      if (
        !req.files.tradeLicense ||
        !req.files.aadhaarCard ||
        !req.files.panCard
      ) {
        return res.status(400).json({
          msg: "Trade Licence, Aadhaar, PAN are mandatory",
        });
      }

      // Extract Cloudinary URLs from the uploaded files
      // The files are now in req.cloudinaryFiles from our middleware
      const cloudinaryFiles = req.cloudinaryFiles || {};
      
      // Process banner if uploaded
      if (req.files.banner && req.files.banner[0]) {
        // Find the corresponding Cloudinary upload result
        const bannerFile = req.cloudinaryFiles?.banner?.[0];
        req.body.banner = bannerFile?.secureUrl || bannerFile?.url;
      }
      
      // Process logo if uploaded
      if (req.files.logo && req.files.logo[0]) {
        const logoFile = req.cloudinaryFiles?.logo?.[0];
        req.body.logo = logoFile?.secureUrl || logoFile?.url;
      }

      // Hash password
      const hashed = await bcrypt.hash(req.body.password, 10);
      
      // Generate vendor ID
      const vendorId = "VEND-" + new Date().getFullYear() + 
                      uuidv4().substring(0, 6).toUpperCase();

      // Prepare documents with Cloudinary URLs
      const documents = {
        tradeLicense: req.cloudinaryFiles?.tradeLicense?.[0]?.secureUrl || 
                     req.files.tradeLicense[0]?.path,
        aadhaarCard: req.cloudinaryFiles?.aadhaarCard?.[0]?.secureUrl || 
                    req.files.aadhaarCard[0]?.path,
        panCard: req.cloudinaryFiles?.panCard?.[0]?.secureUrl || 
                req.files.panCard[0]?.path,
        otherDoc: req.files.otherDoc ? 
                  (req.cloudinaryFiles?.otherDoc?.[0]?.secureUrl || 
                   req.files.otherDoc[0]?.path) : null,
      };

      // Create vendor object
      const vendor = new Vendor({
        vendorId,
        name: req.body.name,
        shopName: req.body.shopName,
        email: req.body.email,
        password: hashed,
        phone: req.body.phone,
        address: req.body.address,
        description: req.body.description,
        logo: req.body.logo,
        banner: req.body.banner,
        documents: documents,
        // Store Cloudinary metadata if needed
        cloudinaryMetadata: {
          tradeLicense: req.cloudinaryFiles?.tradeLicense?.[0],
          aadhaarCard: req.cloudinaryFiles?.aadhaarCard?.[0],
          panCard: req.cloudinaryFiles?.panCard?.[0],
          otherDoc: req.cloudinaryFiles?.otherDoc?.[0],
          logo: req.cloudinaryFiles?.logo?.[0],
          banner: req.cloudinaryFiles?.banner?.[0],
        }
      });

      console.log("Saving vendor...");
      await vendor.save();

      // Remove password from response
      const safeVendor = vendor.toObject();
      delete safeVendor.password;
      delete safeVendor.cloudinaryMetadata; // Optional: remove from response

      res.json({ 
        msg: "Vendor Registered Successfully", 
        vendor: safeVendor 
      });

    } catch (err) {
      console.error("Vendor registration error:", err);
      res.status(500).json({ 
        error: err.message,
        msg: "Failed to register vendor" 
      });
    }
  }
);

router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    // if(req.body.password){
    //     updateData.password = await bcrypt.hash(req.body.password,10);
    // }
    // console.log(req);
    console.log(
      updateData,
      "updateData",
      req.body,
      "req.body",
      req.params.id,
      "id",
    );
    const vendor = await Vendor.findOneAndUpdate(
      { vendorId: req.params.id },
      updateData,
      { returnDocument: "after" },
    ).select("-password");
    console.log(vendor, "updatedVendor");
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });
    res.json({ msg: "Vendor updated", vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
router.patch("/isVerified/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { vendorId: req.params.id },
      { isVerified: true },
      { returnDocument: "after" },
    );

    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    res.json({
      msg: "Vendor verified successfully",
      vendor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/", async (req, res) => {
  const vendors = await Vendor.find().select("-password");
  res.json(vendors);
}
);
router.get("/:id", async (req, res) => {
  const vendor = await Vendor.findOne({ vendorId: req.params.id }).select(
    "-password",
  );
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });
    res.json(vendor);
});
router.delete("/:id", async (req, res) => {
  await Vendor.findOneAndDelete({ vendorId: req.params.id });
  res.json({ msg: "Vendor deleted" });
});

router.get("/vendor/:vendorId", async (req, res) => {
    try {
      console.log(req.params.vendorId, "vendorId");
  const products = await Product.find({ vendor: req.params.vendorId });
      console.log(products, "products");
      res.json(products);
    } catch (err) {

        res.status(500).json({ error: err.message });
    }
});
/// Login 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)

    const vendor = await Vendor.findOne({ email });
    console.log(vendor)

    if (!vendor)
      return res.status(400).json({ msg: "Invalid email or password" });

    const match = await bcrypt.compare(password, vendor.password);

    if (!match)
      return res.status(400).json({ msg: "Invalid email or password" });

    // Check if admin verified vendor
    if (!vendor.isVerified)
      return res.status(403).json({
        msg: "Vendor not verified by admin yet"
      });

    const token = jwt.sign(
      {
        id: vendor._id,
        vendorId: vendor.vendorId,
        role: "vendor"
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const safeVendor = vendor.toObject();
    delete safeVendor.password;

    res.json({
      msg: "Login successful",
      token,
      vendor: safeVendor
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
