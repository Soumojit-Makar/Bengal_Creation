const express = require("express");
const router = express.Router();
const {
  getUpiDetails,
  confirmUpiPayment,
  markPaymentFailed,
  requestRefund,
  processRefund,
  getRefundRequests,
  getOrderReport,
} = require("../controllers/paymentController");

// UPI payment details (returns UPI ID + amount for QR generation on frontend)
router.get("/upi/:orderId", getUpiDetails);

// Confirm UPI payment after user pays
router.post("/upi/confirm", confirmUpiPayment);

// Mark payment as failed
router.post("/failed", markPaymentFailed);

// Refund routes
router.post("/refund/request", requestRefund);
router.post("/refund/process", processRefund);
router.get("/refunds", getRefundRequests);

// Order report
router.get("/report", getOrderReport);

module.exports = router;
