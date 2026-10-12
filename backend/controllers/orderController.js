const mongoose = require("mongoose");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Order = require("../models/Order");
const Product = require("../models/Product");

// Razorpay configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Calculate the actual product price from the database
const getProductPrice = (product) => {
  const originalPrice = Number(product.price || 0);
  const discountPrice = Number(product.discountPrice || 0);

  if (
    discountPrice > 0 &&
    discountPrice < originalPrice
  ) {
    return discountPrice;
  }

  return originalPrice;
};

// Calculate shipping charges
const getShippingCharge = (subtotal) => {
  return subtotal >= 2000 ? 0 : 99;
};

// Validate and prepare order items
const prepareOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const productId = item.product || item._id;
    const quantity = Number(item.quantity);
    const selectedSize = Number(item.selectedSize);

    if (
      !mongoose.isValidObjectId(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error("Invalid product or quantity.");
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("A product in your cart was not found.");
    }

    if (product.stock < quantity) {
      throw new Error(
        `Only ${product.stock} pairs of ${product.name} are available.`
      );
    }

    if (
      !Number.isFinite(selectedSize) ||
      !product.sizes?.some(
        (size) => Number(size) === selectedSize
      )
    ) {
      throw new Error(
        `Selected size is not available for ${product.name}.`
      );
    }

    const price = getProductPrice(product);

    subtotal += price * quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price,
      quantity,
      selectedSize,
    });
  }

  return {
    orderItems,
    subtotal,
    shippingCharge: getShippingCharge(subtotal),
    totalAmount: subtotal + getShippingCharge(subtotal),
  };
};

// Validate customer and shipping details
const validateOrderDetails = (customer, shippingAddress) => {
  if (
    !customer?.name ||
    !customer?.email ||
    !customer?.phone ||
    !shippingAddress?.address ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.pincode
  ) {
    return false;
  }

  return true;
};

// =====================================================
// CREATE COD ORDER
// POST /api/orders
// =====================================================

const createOrder = async (req, res) => {
  const deductedProducts = [];
  let order;

  try {
    const {
      items,
      customer,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // This endpoint is only for Cash on Delivery
    if (paymentMethod && paymentMethod !== "cod") {
      return res.status(400).json({
        success: false,
        message:
          "Online payments must use the payment verification flow.",
      });
    }

    if (!validateOrderDetails(customer, shippingAddress)) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete your customer and shipping details.",
      });
    }

    const {
      orderItems,
      subtotal,
      shippingCharge,
      totalAmount,
    } = await prepareOrderItems(items);

    // Create the order as COD
    order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      customer,
      shippingAddress,
      subtotal,
      shippingCharge,
      totalAmount,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "placed",
    });

    // Deduct stock using an atomic stock check
    for (const item of orderItems) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true }
      );

      if (!product) {
        throw new Error(
          "Stock changed while placing your order. Please try again."
        );
      }

      deductedProducts.push({
        productId: item.product,
        quantity: item.quantity,
      });
    }

    // Record that stock was deducted, if the schema supports it
    if (Object.hasOwn(order.toObject(), "stockDeducted")) {
      order.stockDeducted = true;
      await order.save();
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    // Restore stock if order creation fails midway
    for (const item of deductedProducts) {
      try {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      } catch (rollbackError) {
        console.error("Stock rollback error:", rollbackError);
      }
    }

    if (order?._id) {
      try {
        await Order.findByIdAndDelete(order._id);
      } catch (deleteError) {
        console.error("Order cleanup error:", deleteError);
      }
    }

    console.error("Create COD order error:", error);

    const clientError =
      error.message ===
      "Stock changed while placing your order. Please try again.";

    return res.status(clientError ? 409 : 400).json({
      success: false,
      message: clientError
        ? error.message
        : error.message || "Failed to place order.",
    });
  }
};

// =====================================================
// GET ALL ORDERS - ADMIN
// GET /api/orders
// =====================================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
};

// =====================================================
// GET LOGGED-IN USER ORDERS
// GET /api/orders/user/:userId
// =====================================================

const getUserOrders = async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const loggedInUserId = req.user.userId.toString();

    // Customers can only view their own orders
    if (
      req.user.role !== "admin" &&
      requestedUserId !== loggedInUserId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these orders.",
      });
    }

    const orders = await Order.find({
      user: requestedUserId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders.",
    });
  }
};

// =====================================================
// UPDATE ORDER STATUS - ADMIN
// PUT /api/orders/:id/status
// =====================================================

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "placed",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (
      ["delivered", "cancelled"].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be updated.",
      });
    }

    // Do not cancel a paid online order through this basic
    // status endpoint. A proper refund flow is required.
    if (
      orderStatus === "cancelled" &&
      order.paymentMethod === "online" &&
      order.paymentStatus === "paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This paid online order requires the refund process before cancellation.",
      });
    }

    if (
      orderStatus === "cancelled" &&
      order.stockDeducted === true
    ) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      order.stockDeducted = false;
    }

    order.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// GET /api/orders/:id
// =====================================================

const getSingleOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email role")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const ownerId = order.user?._id
      ? order.user._id.toString()
      : order.user?.toString();

    if (
      req.user.role !== "admin" &&
      ownerId !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get single order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order.",
    });
  }
};

// =====================================================
// CANCEL ORDER
// PUT /api/orders/:id/cancel
// =====================================================

const cancelOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (
      req.user.role !== "admin" &&
      order.user.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order.",
      });
    }

    if (
      ["shipped", "delivered"].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be cancelled.",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled.",
      });
    }

    if (
      order.paymentMethod === "online" &&
      order.paymentStatus === "paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A refund must be processed before cancelling this paid order.",
      });
    }

    // Restore stock only if it was previously deducted
    if (order.stockDeducted === true) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      order.stockDeducted = false;
    }

    order.orderStatus = "cancelled";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel order.",
    });
  }
};

// =====================================================
// CREATE RAZORPAY PAYMENT ORDER
// POST /api/orders/create-payment-order
// =====================================================

const createRazorpayOrder = async (req, res) => {
  try {
    const { items, customer, shippingAddress } = req.body;

    if (!validateOrderDetails(customer, shippingAddress)) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete your customer and shipping details.",
      });
    }

    const {
      orderItems,
      subtotal,
      shippingCharge,
      totalAmount,
    } = await prepareOrderItems(items);

    // Create an order on Razorpay
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `ownshoe_${Date.now()}`,
      notes: {
        userId: String(req.user.userId),
      },
    });

    // Save the pending order in MongoDB
    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      customer,
      shippingAddress,
      subtotal,
      shippingCharge,
      totalAmount,
      paymentMethod: "online",
      paymentStatus: "pending",
      orderStatus: "placed",
      razorpayOrderId: razorpayOrder.id,
      stockDeducted: false,
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully.",
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create payment order.",
    });
  }
};

// =====================================================
// VERIFY RAZORPAY PAYMENT
// POST /api/orders/verify-payment
// =====================================================

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing.",
      });
    }

    // Find the pending order belonging to this user
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment has already been verified.",
        order,
      });
    }

    if (
      order.paymentStatus !== "pending" ||
      order.orderStatus === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "This order is not awaiting payment.",
      });
    }

    // Verify Razorpay's signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    // Verify payment directly with Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment has not been successfully captured.",
      });
    }

    // Atomically claim this order for verification.
    // Only one request can move it from pending to processing.
    const claimedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        paymentStatus: "pending",
        razorpayPaymentId: { $exists: false },
      },
      {
        $set: {
          razorpayPaymentId: razorpay_payment_id,
          paymentStatus: "processing",
        },
      },
      { new: true }
    );

    if (!claimedOrder) {
      const latestOrder = await Order.findById(order._id);

      if (latestOrder?.paymentStatus === "paid") {
        return res.status(200).json({
          success: true,
          message: "Payment has already been verified.",
          order: latestOrder,
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "Payment verification is already in progress. Please check your orders shortly.",
      });
    }

    const deductedProducts = [];

    try {
      // Deduct stock after confirming payment
      for (const item of claimedOrder.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { new: true }
        );

        if (!product) {
          throw new Error(
            `Insufficient stock for ${item.name}.`
          );
        }

        deductedProducts.push({
          productId: item.product,
          quantity: item.quantity,
        });
      }

      claimedOrder.paymentStatus = "paid";
      claimedOrder.stockDeducted = true;

      await claimedOrder.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        order: claimedOrder,
      });
    } catch (error) {
      // Restore any stock already deducted in this attempt
      for (const item of deductedProducts) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      // Do not mark the payment as paid when stock processing fails.
      // The payment itself may already have been captured.
      claimedOrder.paymentStatus = "pending";
      claimedOrder.razorpayPaymentId = undefined;

      await claimedOrder.save();

      console.error("Payment order processing error:", error);

      return res.status(409).json({
        success: false,
        message:
          "Payment was received but the order could not be completed automatically. Please contact support with your payment ID.",
        paymentId: razorpay_payment_id,
      });
    }
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  getSingleOrder,
  cancelOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
};