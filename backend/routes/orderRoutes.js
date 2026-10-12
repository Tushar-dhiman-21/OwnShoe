const express = require("express");

const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  getSingleOrder,
  cancelOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();
router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.get("/user/:userId", authMiddleware, getUserOrders);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.get("/:id", authMiddleware, getSingleOrder);
router.put("/:id/cancel", authMiddleware, cancelOrder);
router.post(  "/create-payment-order",authMiddleware,createRazorpayOrder);
router.post("/verify-payment",authMiddleware,verifyRazorpayPayment);
module.exports = router;
