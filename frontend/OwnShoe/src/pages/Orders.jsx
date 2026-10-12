import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Package,
  MapPin,
  CreditCard,
  CalendarDays,
  XCircle,
  LoaderCircle,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http ://localhost:8000"
).replace(/\/$/, "");

const getAuthToken = () =>
  localStorage.getItem("ownshoe-token") || localStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getAuthToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};

function Orders() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const userId = user?.id || user?._id || user?.userId;

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      setError("Please login to view your orders.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/api/orders/user/${userId}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (response.data.success) {
        setOrders(
          Array.isArray(response.data.orders) ? response.data.orders : [],
        );
      } else {
        setOrders([]);
        setError(response.data.message || "Unable to load orders.");
      }
    } catch (err) {
      console.error("Fetch orders error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load orders. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;

    fetchOrders();
  }, [authLoading, fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmCancel) return;

    try {
      setCancellingId(orderId);

      const response = await axios.put(
        `${API_BASE_URL}/api/orders/${orderId}/cancel`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );

      if (response.data.success) {
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order._id === orderId
              ? { ...order, orderStatus: "cancelled" }
              : order,
          ),
        );
      } else {
        window.alert(response.data.message || "Failed to cancel order.");
      }
    } catch (err) {
      console.error("Cancel order error:", err);

      window.alert(
        err.response?.data?.message ||
          "Failed to cancel order. Please try again.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "placed":
        return "bg-blue-50 text-blue-700";
      case "confirmed":
        return "bg-indigo-50 text-indigo-700";
      case "processing":
        return "bg-yellow-50 text-yellow-700";
      case "shipped":
        return "bg-purple-50 text-purple-700";
      case "delivered":
        return "bg-green-50 text-green-700";
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-orange-600";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle size={35} className="animate-spin text-black" />
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={34} className="text-gray-500" />
          </div>

          <h1 className="text-2xl font-bold text-black mb-2">Please Login</h1>

          <p className="text-gray-500 mb-6">
            Login to view your orders and track your purchases.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-black !text-white font-semibold hover:bg-red-600 transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 !text-gray-700 hover:!text-black font-medium mb-8"
          >
            <ArrowLeft size={18} />
            Back to Profile
          </Link>

          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Package size={34} className="text-red-500" />
              </div>

              <h1 className="text-2xl font-bold text-black mb-2">
                Unable to Load Orders
              </h1>

              <p className="text-gray-500 mb-6">{error}</p>

              <button
                onClick={fetchOrders}
                className="px-6 py-3 rounded-xl bg-black !text-white font-semibold hover:bg-red-600 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 !text-gray-700 hover:!text-black font-medium mb-8"
        >
          <ArrowLeft size={18} />
          Back to Profile
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
              OwnShoe
            </p>

            <h1 className="text-3xl sm:text-4xl font-black text-black">
              My Orders
            </h1>

            <p className="text-gray-500 mt-2">
              Track and manage your OwnShoe purchases.
            </p>
          </div>

          <div className="bg-black text-white rounded-xl px-5 py-3">
            <p className="text-xs text-gray-300">Total Orders</p>
            <p className="text-xl font-bold">{orders.length}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="border border-gray-200 rounded-2xl p-10 sm:p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={34} className="text-gray-500" />
            </div>

            <h2 className="text-2xl font-bold text-black mb-2">
              No Orders Yet
            </h2>

            <p className="text-gray-500 max-w-md mx-auto mb-7">
              You haven't placed any orders yet. Explore our collection and find
              your next pair.
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-black !text-white font-semibold hover:bg-red-600 transition"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
              >
                <div className="p-5 sm:p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Order ID
                        </p>
                        <p className="font-bold text-black text-sm break-all">
                          #
                          {String(order._id || "")
                            .slice(-8)
                            .toUpperCase()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <CalendarDays size={13} />
                          Ordered On
                        </p>
                        <p className="font-semibold text-black text-sm">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Status
                        </p>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyle(order.orderStatus)}`}
                        >
                          {order.orderStatus || "placed"}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-black !text-white font-semibold hover:bg-red-600 transition text-sm"
                    >
                      View Order
                    </Link>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-5">
                    {(order.items || []).map((item, index) => (
                      <div
                        key={`${order._id}-${index}`}
                        className="flex flex-col sm:flex-row gap-4 pb-5 last:pb-0 border-b last:border-b-0 border-gray-100"
                      >
                        <div className="w-full sm:w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name || "Shoe"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag
                                size={28}
                                className="text-gray-400"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-black">
                            {item.name || "Shoe"}
                          </h3>

                          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 text-sm text-gray-600">
                            <span>
                              Size:{" "}
                              <strong className="text-black">
                                {item.selectedSize ?? item.size ?? "N/A"}
                              </strong>
                            </span>

                            <span>
                              Quantity:{" "}
                              <strong className="text-black">
                                {item.quantity ?? 1}
                              </strong>
                            </span>
                          </div>

                          <p className="text-lg font-bold text-black mt-3">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 1)
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7 pt-6 border-t border-gray-200">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={18} className="text-black" />
                        <h3 className="font-bold text-black">
                          Delivery Address
                        </h3>
                      </div>

                      <div className="text-sm text-gray-600 leading-6">
                        <p className="font-semibold text-black">
                          {order.customer?.name || "N/A"}
                        </p>
                        <p>{order.shippingAddress?.address || "N/A"}</p>
                        <p>
                          {order.shippingAddress?.city || ""}
                          {order.shippingAddress?.state
                            ? `, ${order.shippingAddress.state}`
                            : ""}
                          {order.shippingAddress?.pincode
                            ? ` - ${order.shippingAddress.pincode}`
                            : ""}
                        </p>
                        <p>Phone: {order.customer?.phone || "N/A"}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard size={18} className="text-black" />
                        <h3 className="font-bold text-black">Payment</h3>
                      </div>

                      <div className="text-sm space-y-2">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">Method</span>
                          <span className="font-semibold text-black uppercase">
                            {order.paymentMethod || "N/A"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">Payment Status</span>
                          <span
                            className={`font-semibold capitalize ${getPaymentStatusStyle(order.paymentStatus)}`}
                          >
                            {order.paymentStatus || "not_paid"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 pt-2 border-t border-gray-100">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-semibold text-black">
                            ₹
                            {Number(order.subtotal || 0).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">Shipping</span>
                          <span className="font-semibold text-black">
                            {Number(order.shippingCharge || 0) === 0
                              ? "FREE"
                              : `₹${Number(order.shippingCharge).toLocaleString("en-IN")}`}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 pt-2 border-t border-gray-200">
                          <span className="font-bold text-black">Total</span>
                          <span className="font-black text-lg text-black">
                            ₹
                            {Number(order.totalAmount || 0).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.orderStatus !== "shipped" &&
                    order.orderStatus !== "delivered" &&
                    order.orderStatus !== "cancelled" && (
                      <div className="mt-6 pt-5 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingId === order._id}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 !text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === order._id ? (
                            <>
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle size={17} />
                              Cancel Order
                            </>
                          )}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
