import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

const API_URL = `${API_BASE_URL}/api`;

const MyOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      /*
        Change this if your localStorage key
        for logged-in user is different.
      */
      const storedUser = localStorage.getItem("ownshoe-user");

      if (!storedUser) {
        setError("Please login to view your orders.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      const userId = user?._id || user?.id;

      if (!userId) {
        setError("User information not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/orders/user/${userId}`
      );

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  const getOrderStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-50 text-green-600";

      case "shipped":
        return "bg-blue-50 text-blue-600";

      case "confirmed":
        return "bg-indigo-50 text-indigo-600";

      case "cancelled":
        return "bg-red-50 text-red-600";

      case "pending":
        return "bg-yellow-50 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-50 text-green-600";

      case "not_paid":
        return "bg-red-50 text-red-600";

      case "pending":
        return "bg-yellow-50 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-lg border border-[#e1e3e4] bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-black hover:bg-black hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Package
                size={19}
                className="text-[#ac3400]"
              />

              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#ac3400]">
                Orders
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-black">
              My Orders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Track and manage all your OwnShoe orders.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="flex w-fit items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#ac3400] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-[#e1e3e4] bg-white px-6 py-16 text-center">

            <RefreshCw
              size={30}
              className="mx-auto mb-4 animate-spin text-[#ac3400]"
            />

            <p className="text-sm font-semibold text-gray-600">
              Loading your orders...
            </p>

          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

            <p className="font-bold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-4 rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ac3400]"
            >
              Login
            </button>

          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-[#e1e3e4] bg-white px-6 py-16 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag
                size={28}
                className="text-gray-400"
              />
            </div>

            <h2 className="text-xl font-extrabold text-black">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              You haven't placed any orders yet. Explore our collection
              and find your next favorite pair.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ac3400]"
            >
              Start Shopping
            </button>

          </div>
        )}

        {/* ORDERS */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">

            {orders.map((order) => {

              const totalAmount =
                order.totalAmount ??
                order.total ??
                order.amount ??
                0;

              const orderItems =
                order.items ||
                order.products ||
                [];

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white"
                >

                  {/* ORDER HEADER */}
                  <div className="flex flex-col gap-4 border-b border-[#eeeeee] p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <div className="flex items-center gap-2">
                        <Package
                          size={18}
                          className="text-[#ac3400]"
                        />

                        <p className="text-sm font-extrabold text-black">
                          Order #{order._id?.slice(-8).toUpperCase()}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">

                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDate(
                            order.createdAt ||
                              order.orderDate
                          )}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <CreditCard size={14} />
                          {formatPrice(totalAmount)}
                        </span>

                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getOrderStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status || "Pending"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getPaymentStatusClass(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus === "not_paid"
                          ? "Not Paid"
                          : order.paymentStatus || "Pending"}
                      </span>

                    </div>

                  </div>

                  {/* PRODUCTS */}
                  <div className="divide-y divide-[#eeeeee]">

                    {orderItems.length > 0 ? (
                      orderItems.slice(0, 3).map((item, index) => {

                        const product =
                          item.product ||
                          item.productId ||
                          item;

                        const productName =
                          item.name ||
                          product?.name ||
                          "OwnShoe Product";

                        const image =
                          item.image ||
                          item.imageUrl ||
                          product?.images?.[0] ||
                          product?.image;

                        const quantity =
                          item.quantity || 1;

                        const price =
                          item.price ||
                          product?.price ||
                          0;

                        return (
                          <div
                            key={
                              item._id ||
                              item.product ||
                              index
                            }
                            className="flex items-center gap-4 p-5"
                          >

                            {/* IMAGE */}
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f5]">

                              {image ? (
                                <img
                                  src={image}
                                  alt={productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ShoppingBag
                                  size={24}
                                  className="text-gray-300"
                                />
                              )}

                            </div>

                            {/* INFO */}
                            <div className="min-w-0 flex-1">

                              <h3 className="truncate text-sm font-bold text-black sm:text-base">
                                {productName}
                              </h3>

                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">

                                <span>
                                  Qty: {quantity}
                                </span>

                                {item.selectedSize && (
                                  <span>
                                    Size: {item.selectedSize}
                                  </span>
                                )}

                                {item.color && (
                                  <span>
                                    Color: {item.color}
                                  </span>
                                )}

                              </div>

                              <p className="mt-2 text-sm font-bold text-black">
                                {formatPrice(price)}
                              </p>

                            </div>

                          </div>
                        );
                      })
                    ) : (
                      <div className="p-5 text-sm text-gray-500">
                        Order items unavailable.
                      </div>
                    )}

                  </div>

                  {/* MORE ITEMS */}
                  {orderItems.length > 3 && (
                    <div className="border-t border-[#eeeeee] px-5 py-3 text-xs font-semibold text-gray-500">
                      + {orderItems.length - 3} more item
                      {orderItems.length - 3 > 1 ? "s" : ""}
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="flex flex-col gap-4 border-t border-[#eeeeee] bg-[#fafafa] p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Order Total
                      </p>

                      <p className="mt-1 text-lg font-extrabold text-black">
                        {formatPrice(totalAmount)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/orders/${order._id}`)
                      }
                      className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ac3400]"
                    >
                      View Details
                      <ChevronRight size={17} />
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrders;