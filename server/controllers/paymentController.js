const Order = require("../models/order");
require("dotenv").config();

// ── UPI Payment Init ──────────────────────────────────────────────────────────
// Returns the UPI ID from env so frontend can generate QR
const getUpiDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    const upiId = process.env.UPI_ID || process.env.VENDOR_UPI_ID;
    if (!upiId) return res.status(500).json({ msg: "UPI ID not configured" });

    res.json({
      success: true,
      upiId,
      amount: order.totalAmount,
      orderId: order._id,
      merchantName: process.env.VENDOR_SHOP_NAME || "Bengal Creations",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to get UPI details" });
  }
};

// ── Confirm UPI Payment (called after user pays) ──────────────────────────────
const confirmUpiPayment = async (req, res) => {
  try {
    const { orderId, upiTransactionId, upiRef } = req.body;

    if (!orderId) return res.status(400).json({ msg: "orderId required" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "Paid",
        status: "Processing",
        upiTransactionId: upiTransactionId || upiRef || "UPI_MANUAL",
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ msg: "Order not found" });

    res.json({ success: true, message: "Payment confirmed", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Payment confirmation failed" });
  }
};

// ── Mark Payment Failed ───────────────────────────────────────────────────────
const markPaymentFailed = async (req, res) => {
  try {
    const { orderId } = req.body;
    await Order.findByIdAndUpdate(orderId, { paymentStatus: "Failed" });
    res.json({ success: true, msg: "Payment marked as failed" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to update order" });
  }
};

// ── Request Refund (customer) ─────────────────────────────────────────────────
const requestRefund = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.paymentStatus !== "Paid") {
      return res.status(400).json({ msg: "Only paid orders can be refunded" });
    }
    if (order.refundStatus && order.refundStatus !== "None") {
      return res.status(400).json({ msg: "Refund already requested or processed" });
    }

    order.refundStatus = "Requested";
    order.refundReason = reason || "Customer requested refund";
    order.refundAmount = order.totalAmount;
    order.refundRequestedAt = new Date();
    order.status = "Cancelled";
    await order.save();

    res.json({ success: true, msg: "Refund request submitted", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Refund request failed" });
  }
};

// ── Process Refund (vendor/admin) ─────────────────────────────────────────────
const processRefund = async (req, res) => {
  try {
    const { orderId, action, refundAmount } = req.body; // action: "approve" | "reject"

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.refundStatus !== "Requested") {
      return res.status(400).json({ msg: "No pending refund request" });
    }

    if (action === "approve") {
      order.refundStatus = "Approved";
      order.refundAmount = refundAmount || order.totalAmount;
      // For UPI, refund is manual — vendor transfers back to customer's UPI
      // Mark as Processed immediately since it's manual
      order.refundStatus = "Processed";
    } else if (action === "reject") {
      order.refundStatus = "Rejected";
    } else {
      return res.status(400).json({ msg: "action must be 'approve' or 'reject'" });
    }

    await order.save();
    res.json({ success: true, msg: `Refund ${action}d`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Refund processing failed" });
  }
};

// ── Get all refund requests (vendor/admin) ────────────────────────────────────
const getRefundRequests = async (req, res) => {
  try {
    const query = { refundStatus: { $in: ["Requested", "Approved", "Rejected", "Processed"] } };
    if (req.query.vendorId) {
      query["items.vendor"] = req.query.vendorId;
    }
    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("items.product", "name price")
      .sort({ refundRequestedAt: -1 });

    res.json({ success: true, refunds: orders });
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch refund requests" });
  }
};

// ── Order Report (vendor analytics) ──────────────────────────────────────────
const getOrderReport = async (req, res) => {
  try {
    const { vendorId, startDate, endDate } = req.query;

    const match = {};
    if (vendorId) match["items.vendor"] = require("mongoose").Types.ObjectId(vendorId);
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(match)
      .populate("user", "name email phone")
      .populate("items.product", "name price")
      .populate("items.vendor", "shopName")
      .sort({ createdAt: -1 });

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const statusBreakdown = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const paymentBreakdown = orders.reduce((acc, o) => {
      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    const refundTotal = orders
      .filter((o) => o.refundStatus === "Processed")
      .reduce((sum, o) => sum + o.refundAmount, 0);

    res.json({
      success: true,
      totalOrders: orders.length,
      totalRevenue,
      refundTotal,
      statusBreakdown,
      paymentBreakdown,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to generate report" });
  }
};

module.exports = {
  getUpiDetails,
  confirmUpiPayment,
  markPaymentFailed,
  requestRefund,
  processRefund,
  getRefundRequests,
  getOrderReport,
};
