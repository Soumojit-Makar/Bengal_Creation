const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Vendor = require("../models/vendor");
const { cloudinaryUpload, cloudinaryUploadFields } = require("../middleware/upload");
// CREATE PRODUCT
router.post(
  "/",
  async (req, res) => {
    try {
      console.log("Request body:", req.body);
      console.log("Cloudinary files:", req.cloudinaryFiles);

      // Parse numeric values
      req.body.price = parseFloat(req.body.price);
      req.body.stock = parseInt(req.body.stock);
      if (req.body.orginalPrice) {
        req.body.orginalPrice = parseFloat(req.body.orginalPrice);
      }

      // Check if files were uploaded via Cloudinary
      if (!req.cloudinaryFiles || !req.cloudinaryFiles.images || req.cloudinaryFiles.images.length === 0) {
        console.log("No files received");
        return res.status(400).json({ msg: "At least one image is required" });
      }

      // Get image URLs from Cloudinary
      // const imageUrls = req.cloudinaryFiles.images.map(file => file.url);
      // console.log("Image URLs:", imageUrls);

      // Validate file types (Cloudinary handles this, but we can add additional check)
      // const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      // for (let file of req.cloudinaryFiles.images) {
      //   if (file.format && !['png', 'jpg', 'jpeg'].includes(file.format.toLowerCase())) {
      //     return res.status(400).json({ msg: "Only PNG, JPG, JPEG allowed" });
      //   }
      // }

      // Create product
      const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        district: req.body.district,
        originalPrice: req.body.orginalPrice, // Fixed typo: orginalPrice -> originalPrice
        stock: req.body.stock,
        category: req.body.category,
        vendor: req.body.vendor,
        images: req.body.images,
      });

      await product.save();
      
      // Update vendor with product reference
      await Vendor.findByIdAndUpdate(req.body.vendor, {
        $push: { products: product._id },
      });

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product
      });
    } catch (err) {
      console.error("Product creation error:", err);
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }
);
// GET ALL PRODUCTS

router.get("/", async (req, res) => {
  const products = await Product.find()
    .populate("vendor", "shopName")
    .populate("category", "name");

  res.json(products);
});

// GET PRODUCT BY ID

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("vendor")
    .populate("category");

  if (!product) return res.status(404).json({ msg: "Product not found" });

  res.json(product);
});

// UPDATE PRODUCT

router.put("/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
  });

  res.json(product);
});

// DELETE PRODUCT

router.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ msg: "Product deleted" });
});
module.exports = router;
