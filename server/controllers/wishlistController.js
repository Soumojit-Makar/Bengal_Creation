const Wishlist = require("../models/Wishlist");
const Product = require("../models/product");

const addToWishlist = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    

    let wishlist = await Wishlist.findOne({ customer: req.params.userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        customer: req.params.userId,
        products: [],
      });
    }

    const alreadyExists = wishlist.products.some(
      (p) => p.toString() === req.params.productId
    );

    if (!alreadyExists) {
      wishlist.products.push(req.params.productId);
    }

    await wishlist.save();

    res.json({ msg: "Added to wishlist", wishlist });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }

    const wishlist = await Wishlist.findOne({ customer: userId }).populate("products");

    res.json(wishlist || { products: [] });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ customer: req.params.userId });

    if (!wishlist) {
      return res.status(404).json({ msg: "Wishlist empty" });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== req.params.productId
    );

    await wishlist.save();

    res.json({ msg: "Removed from wishlist", wishlist });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };