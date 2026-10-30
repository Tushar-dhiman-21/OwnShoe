
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTruck,
  FaCreditCard,
  FaTimesCircle,
} from "react-icons/fa";
import api from "../api";

const trackingSteps = [
  { label: "Placed", icon: FaBox, status: "placed" },
  { label: "Confirmed", icon: FaCheckCircle, status: "confirmed" },
  { label: "Processing", icon: FaClock, status: "processing" },
  { label: "Shipped", icon: FaTruck, status: "shipped" },
  { label: "Delivered", icon: FaCheckCircle, status: "delivered" },
];

const statusOrder = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const formatStatus = (status) => {
  if (!status) return "Pending";

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setOrder(null);

        const storedUser = localStorage.getItem("ownshoe-user");
        const token =
          localStorage.getItem("ownshoe-token") ||
          localStorage.getItem("token");

        if (!storedUser || !token) {
          if (active) {
            setError("Please log in again to view your order.");
          }
          return;
        }

        let user;

        try {
          user = JSON.parse(storedUser);
        } catch {
          if (active) {
            setError("Invalid user session. Please log in again.");
          }
          return;
        }

        const userId = user?._id || user?.id || user?.userId;

        if (!userId) {
          if (active) {
            setError("User information not found. Please log in again.");
          }
          return;
        }

        // Fetch the logged-in user's orders.
        const response = await api.get(`/api/orders/user/${userId}`);

        const orders = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.orders)
          ? response.data.orders
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const selectedOrder = orders.find(
          (item) => String(item._id) === String(id)
        );

        if (!selectedOrder) {
          if (active) {
            setError(
              "Order not found in your account. Please check My Orders."
            );
          }
          return;
        }

        if (active) {
          setOrder(selectedOrder);
        }
      } catch (err) {
        console.error(
          "Error fetching order details:",
          err.response?.data || err.message
        );

        if (active) {
          if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else if (err.response?.status === 403) {
            setError("You are not authorized to view these orders.");
          } else {
            setError(
              err.response?.data?.message ||
                "Unable to load order details. Please try again."
            );
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <FaTimesCircle className="text-red-500 text-4xl mb-4" />

        <h2 className="text-2xl font-bold text-black mb-2">
          Unable to Load Order
        </h2>

        <p className="text-gray-500 mb-6">
          {error || "We couldn't find this order."}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
          >
            Back to My Orders
          </button>

          <button
            onClick={() => navigate("/login")}
            className="border border-black text-black px-6 py-3 rounded-lg hover:bg-black hover:text-white transition"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  const orderStatus = String(order.orderStatus || "placed").toLowerCase();
  const paymentStatus = String(order.paymentStatus || "pending").toLowerCase();

  const currentStatus = statusOrder.indexOf(orderStatus);
  const isCancelled = orderStatus === "cancelled";

  const items = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.products)
    ? order.products
    : [];

  const shippingAddress = order.shippingAddress || order.address || {};

  const addressText =
    typeof shippingAddress === "string"
      ? shippingAddress
      : [
          shippingAddress.fullName || shippingAddress.name,
          shippingAddress.addressLine ||
            shippingAddress.address ||
            shippingAddress.street,
          shippingAddress.city,
          shippingAddress.state,
          shippingAddress.pincode || shippingAddress.zipCode,
          shippingAddress.phone,
        ]
          .filter(Boolean)
          .join(", ");

  const subtotal =
    order.subtotal ??
    items.reduce(
      (total, item) =>
        total +
        Number(item.price || item.product?.price || 0) *
          Number(item.quantity || 1),
      0
    );

  const shippingCharge = Number(order.shippingCharge || 0);

  const totalAmount = Number(
    order.totalAmount ?? order.total ?? subtotal + shippingCharge
  );

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/orders")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition mb-6"
        >
          <FaArrowLeft />
          Back to My Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Order Details</h1>

            <p className="text-gray-500 text-sm mt-2">
              Order ID: #{String(order._id).slice(-8).toUpperCase()}
            </p>

            <p className="text-gray-500 text-sm mt-1">
              Order Date: {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isCancelled
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-black"
              }`}
            >
              {formatStatus(orderStatus)}
            </span>

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                paymentStatus === "paid"
                  ? "bg-green-100 text-green-700"
                  : paymentStatus === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              Payment: {formatStatus(paymentStatus)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5 sm:p-8 mb-8">
          <h2 className="text-xl font-semibold text-black mb-8">
            Order Tracking
          </h2>

          {isCancelled ? (
            <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl">
              <FaTimesCircle className="text-2xl shrink-0" />
              <div>
                <p className="font-semibold">Order Cancelled</p>
                <p className="text-sm mt-1">
                  This order has been cancelled.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start w-full overflow-x-auto pb-3">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon;
                const completed = currentStatus >= index;
                const isLast = index === trackingSteps.length - 1;

                return (
                  <React.Fragment key={step.status}>
                    <div className="flex flex-col items-center flex-1 min-w-[66px] sm:min-w-[90px]">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                          completed
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon className="text-base sm:text-lg" />
                      </div>

                      <span
                        className={`mt-3 text-xs sm:text-sm text-center whitespace-nowrap ${
                          completed
                            ? "text-black font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {!isLast && (
                      <div className="flex flex-1 items-center min-w-[20px] pt-3.5 sm:pt-4">
                        <div
                          className={`h-[2px] flex-1 ${
                            currentStatus > index
                              ? "bg-black"
                              : "bg-gray-200"
                          }`}
                        />

                        <FaArrowRight
                          className={`text-xs -ml-0.5 ${
                            currentStatus > index
                              ? "text-black"
                              : "text-gray-300"
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <p className="text-sm text-gray-500 mt-5">
            Current status:{" "}
            <span className="font-semibold text-black">
              {formatStatus(orderStatus)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border border-gray-200 rounded-2xl p-5 sm:p-7">
              <h2 className="text-xl font-semibold text-black mb-6">
                Ordered Products
              </h2>

              {items.length === 0 ? (
                <p className="text-gray-500">
                  No product details are available for this order.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item, index) => {
                    const productName =
                      item.name ||
                      item.title ||
                      item.product?.name ||
                      "OwnShoe Product";

                    const image =
                      item.image ||
                      item.product?.image ||
                      item.product?.images?.[0];

                    const price = Number(
                      item.price ?? item.product?.price ?? 0
                    );

                    const quantity = Number(item.quantity || 1);

                    return (
                      <div
                        key={item._id || item.product?._id || index}
                        className="flex gap-4 py-5 first:pt-0 last:pb-0"
                      >
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={productName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <FaBox className="text-3xl text-gray-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-black">
                            {productName}
                          </h3>

                          {item.selectedSize && (
                            <p className="text-sm text-gray-500 mt-2">
                              Size: {item.selectedSize}
                            </p>
                          )}

                          <p className="text-sm text-gray-500 mt-1">
                            Quantity: {quantity}
                          </p>

                          <p className="font-semibold text-black mt-3">
                            {formatPrice(price * quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-black mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-black">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-black">
                    {shippingCharge === 0
                      ? "Free"
                      : formatPrice(shippingCharge)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between gap-4">
                  <span className="font-semibold text-black">Total Amount</span>
                  <span className="text-lg font-bold text-black">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-black mb-5">
                Payment Details
              </h2>

              <div className="flex items-start gap-3 mb-4">
                {String(order.paymentMethod || "")
                  .toLowerCase()
                  .match(/cod|cash/) ? (
                  <FaMoneyBillWave className="text-xl mt-1" />
                ) : (
                  <FaCreditCard className="text-xl mt-1" />
                )}

                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-black mt-1">
                    {formatStatus(order.paymentMethod || "Not specified")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-xl mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="font-medium text-black mt-1">
                    {formatStatus(paymentStatus)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-black mb-5">
                Delivery Address
              </h2>

              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-xl mt-1 shrink-0" />
                <div className="text-sm text-gray-600 leading-6">
                  {addressText || "No delivery address available."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/orders"
           className="inline-flex items-center justify-center gap-2 border-2 border-black !text-black px-6 py-3 rounded-lg font-semibold bg-white hover:!bg-black hover:!text-white transition-all duration-300"
          >
            <FaArrowLeft />
            My Orders
          </Link>

          <Link
            to="/shop"
      className="inline-flex items-center justify-center gap-2 bg-black !text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 hover:!text-white transition-all duration-300 shadow-md"    >
            Continue Shopping
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
