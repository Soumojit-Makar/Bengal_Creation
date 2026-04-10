require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { connectDB } = require("./config/db");
const { seedCategories, seedVendorAndProducts } = require("./seed");

// Routes
const vendorRoutes = require("./routes/vendorRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const customerAuth = require("./routes/customerAuth");
const wishlistRoutes = require("./routes/wishlistRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const couponRoutes = require("./routes/couponRoutes");


const { url } = require("inspector");

const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static("uploads"));

// Database connection
app.use(async (req, res, next) => {
  try {
    await connectDB(); // ✅ ensures DB is connected per request
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// API Routes
app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/auth", customerAuth);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/coupon", couponRoutes);
// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Vendor API Server",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      vendors: "/api/vendors",
      products: "/api/products",
      categories: "/api/categories",
      orders: "/api/orders",
      cart: "/api/cart",
      addresses: "/api/addresses",
      auth: "/api/auth",
      wishlist: "/api/wishlist",
      payment: "/api/payment",
      webhook: "/api/webhook",
      health: "/health",
      contact: "/api/contact",
      
    },
  });
});

// Health check
app.get("/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({
      success: true,
      status: "OK",
      database: "Connected",
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "ERROR",
      database: "Not connected",
      error: error.message,
    });
  }
});

// Swagger docs (optional — generated file)
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

app.use("/api-docs", swaggerUi.serveFiles(swaggerFile));
app.use(
  "/api-docs",
  swaggerUi.setup(swaggerFile, {
    explorer: true,
    customSiteTitle: "Bengal Creations API Documentation",
  })
);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Local dev server
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(
      `📚 API Documentation available at http://localhost:${port}/api-docs`,
    );
  });
}

// Export for Vercel
module.exports = app;
