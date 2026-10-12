import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  Lock,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Trash2,
  CreditCard,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:8000/api";

// =====================================================
// LOAD RAZORPAY CHECKOUT SCRIPT
// =====================================================

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

// =====================================================
// CHECKOUT COMPONENT
// =====================================================

function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [cart, setCart] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  // =====================================================
  // AUTHORIZATION HEADERS
  // =====================================================

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("ownshoe-token") ||
      user?.token;

    if (!token) {
      throw new Error("Login session not found. Please log in again.");
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // =====================================================
  // LOAD CART AND USER INFORMATION
  // =====================================================

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const savedCart = JSON.parse(
        localStorage.getItem("ownshoe-cart") || "[]",
      );

      const updatedCart = savedCart.map((item) => ({
        ...item,
        selectedSize:
          item.selectedSize ||
          (item.sizes && item.sizes.length > 0 ? item.sizes[0] : 6),
      }));

      setCart(updatedCart);

      localStorage.setItem("ownshoe-cart", JSON.stringify(updatedCart));

      setFormData((prev) => ({
        ...prev,
        name: user?.name || "",
        email: user?.email || "",
      }));
    } catch (err) {
      console.error("Failed to load checkout data:", err);
    }
  }, [isAuthenticated, navigate, user]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // GET PRODUCT SIZE
  // =====================================================

  const getItemSize = (item) => {
    if (item.selectedSize) {
      return Number(item.selectedSize);
    }

    if (item.sizes && item.sizes.length > 0) {
      return Number(item.sizes[0]);
    }

    return 6;
  };

  // =====================================================
  // REMOVE CART ITEM
  // =====================================================

  const handleRemoveItem = (itemId, selectedSize) => {
    const updatedCart = cart.filter(
      (item) =>
        !(item._id === itemId && getItemSize(item) === Number(selectedSize)),
    );

    setCart(updatedCart);

    localStorage.setItem("ownshoe-cart", JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));
  };

  // =====================================================
  // PRICE CALCULATIONS
  // =====================================================

  const subtotal = cart.reduce((total, item) => {
    return (
      total +
      Number(item.price || item.discountPrice || 0) * Number(item.quantity || 1)
    );
  }, 0);

  const shippingCharge = subtotal === 0 || subtotal >= 2000 ? 0 : 99;

  const totalAmount = subtotal + shippingCharge;

  // =====================================================
  // VALIDATE CHECKOUT FORM
  // =====================================================

  const validateCheckout = () => {
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return false;
    }

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return false;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!formData.address.trim()) {
      setError("Please enter your delivery address.");
      return false;
    }

    if (!formData.city.trim()) {
      setError("Please enter your city.");
      return false;
    }

    if (!formData.state.trim()) {
      setError("Please enter your state.");
      return false;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return false;
    }

    const missingSize = cart.find((item) => !getItemSize(item));

    if (missingSize) {
      setError(`Please select a size for ${missingSize.name} before checkout.`);
      return false;
    }

    return true;
  };

  // =====================================================
  // PREPARE ORDER DATA
  // =====================================================

  const prepareOrderData = () => {
    const orderItems = cart.map((item) => ({
      product: item._id,
      name: item.name,
      image: item.images && item.images.length > 0 ? item.images[0] : "",
      price: Number(
        item.discountPrice || item.price || item.originalPrice || 0,
      ),
      quantity: Number(item.quantity || 1),
      selectedSize: getItemSize(item),
    }));

    return {
      items: orderItems,

      customer: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },

      shippingAddress: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      },
    };
  };

  // =====================================================
  // COMPLETE ORDER AFTER SUCCESSFUL PAYMENT
  // =====================================================

  const completeOrder = (order) => {
    localStorage.removeItem("ownshoe-cart");

    window.dispatchEvent(new Event("cartUpdated"));

    setCart([]);
    setOrderSuccess(order);
    setError("");
  };

  // =====================================================
  // CASH ON DELIVERY
  // =====================================================

  const handleCODOrder = async (orderData) => {
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        ...orderData,
        paymentMethod: "cod",
      },
      {
        headers: getAuthHeaders(),
      },
    );

    const createdOrder = response.data.order || response.data;

    if (!createdOrder || !createdOrder._id) {
      throw new Error(response.data.message || "Order response was invalid.");
    }

    completeOrder(createdOrder);
  };

  // =====================================================
  // RAZORPAY ONLINE PAYMENT
  // =====================================================

  const handleRazorpayPayment = async (orderData) => {
    // Load Razorpay checkout script.
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error(
        "Unable to load Razorpay checkout. Please check your internet connection.",
      );
    }

    // Ask backend to create a Razorpay order.
    const createResponse = await axios.post(
      `${API_URL}/orders/create-payment-order`,
      orderData,
      {
        headers: getAuthHeaders(),
      },
    );

    const { keyId, razorpayOrderId, amount, currency } = createResponse.data;

    if (!keyId || !razorpayOrderId || !amount) {
      throw new Error(
        "Payment order could not be initialized. Please try again.",
      );
    }

    // Open Razorpay payment window.
    return new Promise((resolve, reject) => {
      let paymentFinished = false;

      const options = {
        key: keyId,

        amount,

        currency,

        name: "OwnShoe",

        description: "Shoe Order Payment",

        order_id: razorpayOrderId,

        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },

        notes: {
          address: `${formData.address}, ${formData.city}`,
        },

        theme: {
          color: "#dc2626",
        },

        // Razorpay calls this after checkout succeeds.
        handler: async (paymentResponse) => {
          if (paymentFinished) return;

          paymentFinished = true;

          try {
            setError("");

            // Verify payment signature on backend.
            const verifyResponse = await axios.post(
              `${API_URL}/orders/verify-payment`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,

                razorpay_payment_id: paymentResponse.razorpay_payment_id,

                razorpay_signature: paymentResponse.razorpay_signature,
              },
              {
                headers: getAuthHeaders(),
              },
            );

            const verifiedOrder = verifyResponse.data.order;

            if (!verifiedOrder || verifiedOrder.paymentStatus !== "paid") {
              throw new Error(
                "Payment could not be verified. Please contact support before trying to pay again.",
              );
            }

            resolve(verifiedOrder);
          } catch (err) {
            console.error("Payment verification error:", err);

            reject(
              new Error(
                err.response?.data?.message ||
                  err.message ||
                  "Payment verification failed. Please check your order before retrying.",
              ),
            );
          }
        },

        modal: {
          ondismiss: () => {
            if (paymentFinished) return;

            paymentFinished = true;

            reject(
              new Error("Payment window closed. Your cart has been saved."),
            );
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        if (paymentFinished) return;

        paymentFinished = true;

        console.error("Razorpay payment failed:", response.error);

        reject(
          new Error(
            response.error?.description || "Payment failed. Please try again.",
          ),
        );
      });

      razorpay.open();
    });
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateCheckout()) {
      return;
    }

    try {
      setLoading(true);

      const orderData = prepareOrderData();

      if (paymentMethod === "cod") {
        await handleCODOrder(orderData);
      } else if (paymentMethod === "online") {
        const verifiedOrder = await handleRazorpayPayment(orderData);

        completeOrder(verifiedOrder);
      } else {
        throw new Error("Please select a valid payment method.");
      }
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to complete checkout. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ORDER SUCCESS PAGE
  // =====================================================

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle size={46} className="text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Order Placed!</h1>

          <p className="mt-3 text-gray-500">
            Thank you for shopping with OwnShoe.
          </p>

          <div className="mt-6 bg-gray-50 rounded-xl p-5 text-left">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Order ID</span>

              <span className="font-semibold text-gray-900 break-all text-right">
                #{orderSuccess._id}
              </span>
            </div>

            <div className="flex justify-between mt-3">
              <span className="text-gray-500">Payment Method</span>

              <span className="font-semibold uppercase">
                {orderSuccess.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between mt-3">
              <span className="text-gray-500">Payment Status</span>

              <span
                className={`font-semibold uppercase ${
                  orderSuccess.paymentStatus === "paid"
                    ? "text-green-600"
                    : "text-gray-700"
                }`}
              >
                {orderSuccess.paymentStatus}
              </span>
            </div>

            <div className="flex justify-between mt-3">
              <span className="text-gray-500">Total</span>

              <span className="font-bold text-lg">
                ₹{Number(orderSuccess.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              to="/shop"
              className="flex-1 h-12 rounded-xl bg-black !text-white flex items-center justify-center font-semibold hover:bg-red-600 hover:!text-white transition"
            >
              Continue Shopping
            </Link>

            <Link
              to="/profile"
              className="flex-1 h-12 rounded-xl border border-gray-300 text-gray-900 flex items-center justify-center font-semibold hover:border-black transition"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={60} className="mx-auto text-gray-300" />

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-500">
            Add some shoes before going to checkout.
          </p>
<Link
  to="/shop"
  className="inline-flex mt-6 px-7 h-12 items-center justify-center rounded-xl bg-white text-white font-semibold hover:bg-red-600 hover:text-white transition-all duration-300"
>
  Shop Now
</Link>


        </div>
      </div>
    );
  }

  // =====================================================
  // CHECKOUT PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* HEADER */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock size={16} />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600 uppercase tracking-widest">
            OwnShoe
          </p>

          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-500">
            Complete your details and place your order.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* LEFT SIDE */}
            <div className="space-y-6">
              {/* CONTACT INFORMATION */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Contact Information
                    </h2>

                    <p className="text-sm text-gray-500">
                      We'll use this information for your order.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 outline-none focus:border-black transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 outline-none focus:border-black transition"
                      readOnly
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        inputMode="numeric"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-300 outline-none focus:border-black transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DELIVERY ADDRESS */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Delivery Address
                    </h2>

                    <p className="text-sm text-gray-500">
                      Where should we deliver your shoes?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House no., street, area..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-black transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 outline-none focus:border-black transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 outline-none focus:border-black transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>

                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Pincode"
                        maxLength={6}
                        inputMode="numeric"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 outline-none focus:border-black transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Payment Method
                </h2>

                <div className="mt-5 space-y-3">
                  {/* COD OPTION */}
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                      paymentMethod === "cod"
                        ? "border-black bg-gray-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 accent-black"
                    />

                    <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ShoppingBag size={22} />
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Cash on Delivery
                      </p>

                      <p className="text-sm text-gray-500">
                        Pay when your order arrives.
                      </p>
                    </div>
                  </label>

                  {/* RAZORPAY OPTION */}
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                      paymentMethod === "online"
                        ? "border-black bg-gray-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 accent-black"
                    />

                    <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <CreditCard size={22} />
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Pay Online</p>

                      <p className="text-sm text-gray-500">
                        UPI, cards and other available payment options.
                      </p>

                      <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-1 rounded">
                        Razorpay Test Mode
                      </span>
                    </div>
                  </label>
                </div>

                {paymentMethod === "online" && (
                  <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div className="flex gap-3">
                      <Lock
                        size={18}
                        className="text-green-600 shrink-0 mt-0.5"
                      />

                      <p className="text-sm text-gray-600">
                        Your payment will be processed through Razorpay's secure
                        checkout. Test Mode is intended for testing and does not
                        represent a real successful purchase.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
                >
                  {error}
                </div>
              )}
            </div>

            {/* RIGHT SIDE - ORDER SUMMARY */}
            <div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:sticky lg:top-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-5 max-h-[420px] overflow-y-auto pr-1">
                  {cart.map((item, index) => {
                    const image =
                      item.images && item.images.length > 0
                        ? item.images[0]
                        : "https://via.placeholder.com/150x180?text=OwnShoe";

                    const itemSize = getItemSize(item);

                    return (
                      <div
                        key={`${item._id}-${itemSize}-${index}`}
                        className="flex gap-3"
                      >
                        <div className="relative w-20 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                          <img
                            src={image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />

                          <span className="absolute top-1 right-1 min-w-5 h-5 px-1 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                            {item.quantity || 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-wider text-gray-400">
                                {item.brand}
                              </p>

                              <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2">
                                {item.name}
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveItem(item._id, itemSize)
                              }
                              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Remove item"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>

                          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                            <span>Size: {itemSize}</span>

                            <span>× {item.quantity || 1}</span>
                          </div>

                          <p className="mt-2 font-semibold text-gray-900">
                            ₹
                            {(
                              Number(item.price || item.discountPrice || 0) *
                              Number(item.quantity || 1)
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PRICE BREAKDOWN */}
                <div className="border-t border-gray-200 mt-6 pt-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>

                    <span className="font-medium">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>

                    <span className="font-medium">
                      {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="text-lg font-bold">Total</span>

                    <span className="text-xl font-bold">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* FREE SHIPPING MESSAGE */}
                {subtotal < 2000 && (
                  <div className="mt-5 bg-gray-50 rounded-xl p-3 text-center text-xs text-gray-600">
                    Add ₹{(2000 - subtotal).toLocaleString("en-IN")} more for
                    FREE shipping.
                  </div>
                )}

                {/* PLACE ORDER BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 min-h-13 px-4 py-3 rounded-xl bg-black text-white font-bold flex items-center justify-center gap-2 hover:bg-red-600 hover:scale-[1.01] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "Processing..."
                  ) : paymentMethod === "online" ? (
                    <>
                      <Lock size={17} />
                      Pay ₹{totalAmount.toLocaleString("en-IN")}
                    </>
                  ) : (
                    <>
                      <Lock size={17} />
                      Place Order · ₹{totalAmount.toLocaleString("en-IN")}
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-gray-400">
                  By placing your order, you agree to OwnShoe's terms and
                  conditions.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
