const express = require("express");
const router  = express.Router();
const {
  createOrder, getChargePreview,
  getOrdersByUser, getOrdersByStatus,
  getAllOrders, getOrderById,
  updateOrderStatus, updatePaymentStatus,
  getOrdersByVendor, deleteOrder,
} = require("../controllers/orderController");

router.get("/charge-preview", getChargePreview);   // ?subtotal=&discountAmount=
router.post("/", createOrder);
router.get("/user/:userId",    getOrdersByUser);
router.get("/status/:status",  getOrdersByStatus);
router.get("/vendor/:vendorId",getOrdersByVendor);
router.get("/",                getAllOrders);
router.get("/:id",             getOrderById);
router.patch("/status/:id",    updateOrderStatus);
router.patch("/payment-status/:id", updatePaymentStatus);
router.delete("/:id",          deleteOrder);

module.exports = router;
