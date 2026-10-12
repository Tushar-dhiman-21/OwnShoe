import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Package,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  ChevronDown,
  X,
  LoaderCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  UserRound,
  ShoppingBag,
} from "lucide-react";
import {api} from "../api.js";

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

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

const formatDateTime = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCustomer = (order) => {
  const customer = order?.customer || order?.user || {};

  return {
    name: customer.name || order?.customerName || "Customer",
    email: customer.email || order?.email || "N/A",
    phone: customer.phone || customer.mobile || order?.phone || "N/A",
  };
};

const getStatusClass = (status) => {
  const styles = {
    placed: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    styles[String(status || "").toLowerCase()] || "bg-gray-100 text-gray-700"
  );
};

const getPaymentClass = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (["paid", "completed", "success"].includes(normalized)) {
    return "bg-green-100 text-green-800";
  }

  if (["failed", "cancelled"].includes(normalized)) {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
};

const getOrderItems = (order) =>
  Array.isArray(order?.items) ? order.items : [];

const getItemImage = (item) =>
  item?.image || item?.product?.images?.[0] || item?.product?.image || "";

const getItemName = (item) =>
  item?.name || item?.product?.name || "Shoe Product";

const getItemPrice = (item) => Number(item?.price ?? item?.product?.price ?? 0);

const getItemQuantity = (item) => Number(item?.quantity) || 1;

const getOrderTotal = (order) =>
  Number(order?.totalAmount ?? order?.total ?? order?.grandTotal ?? 0);

const getOrderStatus = (order) =>
  String(order?.orderStatus || order?.status || "placed").toLowerCase();

const getShippingAddress = (order) =>
  order?.shippingAddress || order?.address || {};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getAuthConfig = useCallback(() => {
    const token =
      localStorage.getItem("ownshoe-token") || localStorage.getItem("token");

    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, []);

  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      try {
        const response = await api.get("/api/orders", getAuthConfig());

        const data = response?.data;

        const fetchedOrders = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
            ? data.orders
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.data?.orders)
                ? data.data.orders
                : [];

        setOrders(fetchedOrders);

        setSelectedOrder((current) => {
          if (!current?._id) return null;

          return (
            fetchedOrders.find(
              (order) => String(order._id) === String(current._id),
            ) || null
          );
        });
      } catch (err) {
        console.error("Fetch orders error:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Orders load nahi ho paaye. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getAuthConfig],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = getCustomer(order);
      const orderId = String(order?._id || "").toLowerCase();
      const status = getOrderStatus(order);

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter((order) =>
        ["placed", "confirmed"].includes(getOrderStatus(order)),
      ).length,

      shipped: orders.filter((order) => getOrderStatus(order) === "shipped")
        .length,

      delivered: orders.filter((order) => getOrderStatus(order) === "delivered")
        .length,
    };
  }, [orders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;

    const currentOrder = orders.find(
      (order) => String(order._id) === String(orderId),
    );

    if (!currentOrder) return;

    const currentStatus = getOrderStatus(currentOrder);

    if (["delivered", "cancelled"].includes(currentStatus)) {
      setError(
        "Delivered ya cancelled order ka status yahan se change nahi kar sakte.",
      );
      return;
    }

    if (!ORDER_STATUSES.includes(newStatus)) {
      setError("Invalid order status.");
      return;
    }

    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/api/orders/${orderId}/status`,
        { orderStatus: newStatus },
        getAuthConfig(),
      );

      const responseOrder =
        response?.data?.order ||
        response?.data?.data?.order ||
        response?.data?.data ||
        null;

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          String(order._id) === String(orderId)
            ? {
                ...order,
                ...(responseOrder && typeof responseOrder === "object"
                  ? responseOrder
                  : {}),
                orderStatus:
                  responseOrder?.orderStatus ||
                  responseOrder?.status ||
                  newStatus,
              }
            : order,
        ),
      );

      setSelectedOrder((previous) => {
        if (String(previous?._id) !== String(orderId)) {
          return previous;
        }

        return {
          ...previous,
          ...(responseOrder && typeof responseOrder === "object"
            ? responseOrder
            : {}),
          orderStatus:
            responseOrder?.orderStatus || responseOrder?.status || newStatus,
        };
      });

      setSuccess("Order status successfully update ho gaya.");

      // Server se latest order data sync kar lo.
      await fetchOrders(true);
    } catch (err) {
      console.error("Update order status error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Order status update nahi hua. Please try again.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const closeModal = () => {
    if (updatingId) return;
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              to="/admin"
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium transition hover:border-red-600 hover:text-red-600"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Manage Orders
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              View customer orders and manage their delivery status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Refresh Orders
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1">{error}</div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Orders",
              value: stats.total,
              icon: Package,
            },
            {
              label: "Pending Orders",
              value: stats.pending,
              icon: CalendarDays,
            },
            {
              label: "Shipped Orders",
              value: stats.shipped,
              icon: ShoppingBag,
            },
            {
              label: "Delivered Orders",
              value: stats.delivered,
              icon: Package,
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>

                  <div className="rounded-xl bg-red-50 p-3 text-red-600">
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Search and filters */}
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order ID, customer, email or phone..."
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-black outline-none placeholder:text-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="relative sm:w-56">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm font-medium text-black outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
            >
              <option value="all">All Statuses</option>

              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        {/* Orders table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-bold">All Orders</h2>

            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <LoaderCircle size={32} className="animate-spin text-red-600" />
              <p className="text-sm text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <Package size={42} className="mb-3 text-gray-400" />

              <h3 className="text-lg font-bold">No orders found</h3>

              <p className="mt-1 text-sm text-gray-600">
                Try changing the search term or status filter.
              </p>

              {(search || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 font-semibold text-red-600 hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const customer = getCustomer(order);
                    const orderStatus = getOrderStatus(order);
                    const paymentStatus = order.paymentStatus || "pending";

                    return (
                      <tr
                        key={order._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold">
                            #
                            {String(order._id || "")
                              .slice(-8)
                              .toUpperCase()}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {getOrderItems(order).length} item(s)
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold">{customer.name}</p>

                          <p className="mt-1 max-w-48 truncate text-xs text-gray-500">
                            {customer.email}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-bold">
                          {formatCurrency(getOrderTotal(order))}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium">
                            {String(order.paymentMethod || "N/A").toUpperCase()}
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentClass(
                              paymentStatus,
                            )}`}
                          >
                            {paymentStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass(
                              orderStatus,
                            )}`}
                          >
                            {orderStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold transition hover:border-red-600 hover:bg-red-50 hover:text-red-600"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {(() => {
              const customer = getCustomer(selectedOrder);
              const address = getShippingAddress(selectedOrder);
              const orderStatus = getOrderStatus(selectedOrder);
              const items = getOrderItems(selectedOrder);
              const isFinalStatus = ["delivered", "cancelled"].includes(
                orderStatus,
              );

              const subtotal = Number(
                selectedOrder.subtotal ??
                  items.reduce(
                    (total, item) =>
                      total + getItemPrice(item) * getItemQuantity(item),
                    0,
                  ),
              );

              const shippingCharge = Number(
                selectedOrder.shippingCharge ?? selectedOrder.shippingCost ?? 0,
              );

              return (
                <>
                  {/* Modal header */}
                  <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-5 sm:px-7">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                        Order Details
                      </p>

                      <h2
                        id="order-modal-title"
                        className="mt-1 text-xl font-bold sm:text-2xl"
                      >
                        Order #
                        {String(selectedOrder._id || "")
                          .slice(-8)
                          .toUpperCase()}
                      </h2>

                      <p className="mt-1 text-sm text-gray-600">
                        Placed on {formatDateTime(selectedOrder.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={Boolean(updatingId)}
                      aria-label="Close order details"
                      className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100 disabled:opacity-50"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6 p-5 sm:p-7">
                    {/* Customer and address */}
                    <div className="grid gap-5 md:grid-cols-2">
                      <section className="rounded-xl border border-gray-200 p-4">
                        <h3 className="mb-4 flex items-center gap-2 font-bold">
                          <UserRound size={18} className="text-red-600" />
                          Customer Information
                        </h3>

                        <div className="space-y-3 text-sm">
                          <p className="font-semibold">{customer.name}</p>

                          <p className="flex items-start gap-2 break-all text-gray-600">
                            <Mail size={16} className="mt-0.5 shrink-0" />
                            {customer.email}
                          </p>

                          <p className="flex items-center gap-2 text-gray-600">
                            <Phone size={16} className="shrink-0" />
                            {customer.phone}
                          </p>
                        </div>
                      </section>

                      <section className="rounded-xl border border-gray-200 p-4">
                        <h3 className="mb-4 flex items-center gap-2 font-bold">
                          <MapPin size={18} className="text-red-600" />
                          Shipping Address
                        </h3>

                        <div className="space-y-1 text-sm leading-6 text-gray-700">
                          <p>
                            {address.address ||
                              address.street ||
                              address.fullAddress ||
                              "Address not available"}
                          </p>

                          {(address.city ||
                            address.state ||
                            address.pincode ||
                            address.zipCode) && (
                            <p>
                              {[
                                address.city,
                                address.state,
                                address.pincode || address.zipCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}

                          {address.country && <p>{address.country}</p>}
                        </div>
                      </section>
                    </div>

                    {/* Ordered products */}
                    <section>
                      <h3 className="mb-3 flex items-center gap-2 font-bold">
                        <ShoppingBag size={19} className="text-red-600" />
                        Ordered Products ({items.length})
                      </h3>

                      {items.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
                          Product details are not available for this order.
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200">
                          {items.map((item, index) => {
                            const image = getItemImage(item);
                            const name = getItemName(item);
                            const quantity = getItemQuantity(item);
                            const price = getItemPrice(item);

                            return (
                              <div
                                key={item._id || item.product?._id || index}
                                className="flex items-center gap-4 p-4"
                              >
                                {image ? (
                                  <img
                                    src={image}
                                    alt={name}
                                    className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 object-cover"
                                  />
                                ) : (
                                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                    <Package
                                      size={24}
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold">
                                    {name}
                                  </p>

                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                                    {item.selectedSize && (
                                      <span>Size: {item.selectedSize}</span>
                                    )}

                                    {item.size && (
                                      <span>Size: {item.size}</span>
                                    )}

                                    <span>Qty: {quantity}</span>
                                  </div>
                                </div>

                                <p className="whitespace-nowrap text-sm font-bold">
                                  {formatCurrency(price * quantity)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    {/* Payment summary */}
                    <section className="ml-auto max-w-sm rounded-xl border border-gray-200 p-5">
                      <h3 className="mb-4 font-bold">Payment Summary</h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between gap-4 text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>

                        <div className="flex justify-between gap-4 text-gray-600">
                          <span>Shipping</span>
                          <span>
                            {shippingCharge === 0
                              ? "Free"
                              : formatCurrency(shippingCharge)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-base font-bold">
                          <span>Total</span>
                          <span>
                            {formatCurrency(getOrderTotal(selectedOrder))}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Payment Status</span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPaymentClass(
                              selectedOrder.paymentStatus,
                            )}`}
                          >
                            {selectedOrder.paymentStatus || "pending"}
                          </span>
                        </div>
                      </div>
                    </section>

                    {/* Status update */}
                    <section className="rounded-xl border border-gray-200 p-5">
                      <h3 className="mb-3 font-bold">Update Order Status</h3>

                      {isFinalStatus ? (
                        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                          This order is{" "}
                          <span className="font-semibold capitalize">
                            {orderStatus}
                          </span>
                          . Its status cannot be changed from this screen.
                        </div>
                      ) : (
                        <>
                          <p className="mb-3 text-sm text-gray-600">
                            Current status:{" "}
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                orderStatus,
                              )}`}
                            >
                              {orderStatus}
                            </span>
                          </p>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                              <select
                                value={orderStatus}
                                disabled={Boolean(updatingId)}
                                onChange={(event) =>
                                  updateOrderStatus(
                                    selectedOrder._id,
                                    event.target.value,
                                  )
                                }
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm font-medium text-black outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                              >
                                {ORDER_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </option>
                                ))}
                              </select>

                              <ChevronDown
                                size={17}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                              />
                            </div>

                            {updatingId && (
                              <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
                                <LoaderCircle
                                  size={18}
                                  className="animate-spin"
                                />
                                Updating...
                              </div>
                            )}
                          </div>

                          <p className="mt-3 text-xs text-gray-500">
                            Status changes are saved to the server.
                          </p>
                        </>
                      )}
                    </section>
                  </div>

                  {/* Modal footer */}
                  <div className="sticky bottom-0 flex justify-end border-t border-gray-200 bg-white px-5 py-4 sm:px-7">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={Boolean(updatingId)}
                      className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
