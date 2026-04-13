const express = require("express");
const router = express.Router();
const superAdminAuth = require("../middleware/superAdminAuth");
const {
  sendLoginOtp, verifyLoginOtp,
  getDashboardStats,
  listVendors, approveVendor, rejectVendor,
  listCustomers, deleteCustomer,
  listAllOrders, updateOrderStatus, bulkUpdateOrders, manualCharge,
  listRefunds, processRefundAdmin,
  listCoupons, createCoupon, updateCoupon, deleteCoupon,
  getRevenueReport,
  getPlatformSettings, updatePlatformSettings,
} = require("../controllers/superAdminController");

// ── Auth (public) ──────────────────────────────────────────────────────────────
router.post("/auth/send-otp",    sendLoginOtp);
router.post("/auth/verify-otp",  verifyLoginOtp);

// All routes below require super admin token
router.use(superAdminAuth);

// ── Dashboard ──────────────────────────────────────────────────────────────────
router.get("/dashboard", getDashboardStats);

// ── Platform Settings (Charges) ────────────────────────────────────────────────
router.get("/settings",   getPlatformSettings);
router.patch("/settings", updatePlatformSettings);

// ── Vendors ────────────────────────────────────────────────────────────────────
router.get("/vendors",                 listVendors);
router.patch("/vendors/:id/approve",   approveVendor);
router.delete("/vendors/:id/reject",   rejectVendor);

// ── Customers ──────────────────────────────────────────────────────────────────
router.get("/customers",        listCustomers);
router.delete("/customers/:id", deleteCustomer);

// ── Orders ─────────────────────────────────────────────────────────────────────
router.get("/orders",                  listAllOrders);
router.patch("/orders/:id",            updateOrderStatus);
router.post("/orders/bulk-update",     bulkUpdateOrders);
router.post("/orders/manual-charge",   manualCharge);

// ── Refunds ────────────────────────────────────────────────────────────────────
router.get("/refunds",           listRefunds);
router.post("/refunds/process",  processRefundAdmin);

// ── Coupons ────────────────────────────────────────────────────────────────────
router.get("/coupons",         listCoupons);
router.post("/coupons",        createCoupon);
router.patch("/coupons/:id",   updateCoupon);
router.delete("/coupons/:id",  deleteCoupon);

// ── Revenue ────────────────────────────────────────────────────────────────────
router.get("/revenue", getRevenueReport);

module.exports = router;
