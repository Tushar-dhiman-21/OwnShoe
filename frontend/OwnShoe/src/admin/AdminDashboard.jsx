import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  TrendingUp,
  Clock3,
  CheckCircle,
  Truck,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { api } from "../api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // AUTH CONFIG
  // =========================================

  const getAuthConfig = useCallback(() => {
    const activeToken = token || localStorage.getItem("ownshoe-token");

    if (!activeToken) {
      throw new Error("Please login first to access the admin dashboard.");
    }

    return {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    };
  }, [token]);

  // =========================================
  // RESPONSE HELPERS
  // =========================================

  const extractArray = (response, keys = []) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (!data) {
      return [];
    }

    for (const key of keys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }

    return [];
  };

  // =========================================
  // FETCH DASHBOARD DATA
  // =========================================

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const config = getAuthConfig();

        // Orders and products are essential.
        const [ordersResponse, productsResponse] = await Promise.all([
          api.get("/api/orders", config),
          api.get("/api/products", config),
        ]);

        const fetchedOrders = extractArray(ordersResponse, ["orders", "data"]);

        const fetchedProducts = extractArray(productsResponse, [
          "products",
          "data",
        ]);

        setOrders(fetchedOrders);
        setProducts(fetchedProducts);

        // Customers are fetched separately.
        // A customer API failure should not break the dashboard.
        try {
          const customersResponse = await api.get(
            "/api/users/customers",
            config,
          );

          const fetchedCustomers = extractArray(customersResponse, [
            "customers",
            "users",
            "data",
          ]);

          setCustomers(fetchedCustomers);
        } catch (customerError) {
          console.error("Unable to fetch registered customers:", customerError);

          // Fallback: customers who have placed orders.
          const uniqueCustomerMap = new Map();

          fetchedOrders.forEach((order) => {
            const customer = order.user || order.customer;

            if (customer) {
              const customerId =
                typeof customer === "object" ? customer._id : customer;

              if (customerId) {
                uniqueCustomerMap.set(String(customerId), customer);
              }
            }
          });

          setCustomers([...uniqueCustomerMap.values()]);
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        if (err.message?.includes("Please login first")) {
          setError(err.message);
        } else if (err.response?.status === 401) {
          setError("Your session has expired. Please login again.");
        } else if (err.response?.status === 403) {
          setError("Access denied. Admin permission is required.");
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load dashboard data. Please try again.",
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getAuthConfig],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // =========================================
  // STATISTICS
  // =========================================

  const totalOrders = orders.length;

  const totalProducts = products.length;

  const totalCustomers = customers.length;

  // Sales from delivered orders only.
  const deliveredSales = orders
    .filter((order) => order.orderStatus === "delivered")
    .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

  // Pending orders.
  const pendingOrders = orders.filter((order) =>
    ["placed", "confirmed"].includes(order.orderStatus),
  ).length;

  // Processing orders.
  const processingOrders = orders.filter(
    (order) => order.orderStatus === "processing",
  ).length;

  // Shipped orders.
  const shippedOrders = orders.filter(
    (order) => order.orderStatus === "shipped",
  ).length;

  // Delivered orders.
  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "delivered",
  ).length;

  // Cancelled orders.
  const cancelledOrders = orders.filter(
    (order) => order.orderStatus === "cancelled",
  ).length;

  // Recent orders.
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 5);

  // =========================================
  // FORMAT HELPERS
  // =========================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "placed":
        return "bg-blue-50 text-blue-700";

      case "confirmed":
        return "bg-indigo-50 text-indigo-700";

      case "processing":
        return "bg-orange-50 text-orange-700";

      case "shipped":
        return "bg-purple-50 text-purple-700";

      case "delivered":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================
  // LOADING SCREEN
  // =========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <RefreshCw
            size={36}
            className="animate-spin mx-auto mb-4 text-red-600"
          />

          <h2 className="text-xl font-bold text-black">
            Loading Admin Dashboard
          </h2>

          <p className="text-gray-600 mt-2">
            Fetching your store information...
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // ERROR SCREEN
  // =========================================

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={34} className="text-red-600" />
          </div>

          <h2 className="text-2xl font-black text-black">Dashboard Error</h2>

          <p className="text-gray-600 mt-3 mb-6">{error}</p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => fetchDashboardData()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-red-600 transition-colors duration-300"
            >
              <RefreshCw size={17} />
              Try Again
            </button>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-black font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              <ArrowLeft size={17} />
              Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // DASHBOARD
  // =========================================

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BACK BUTTON */}

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-red-600 font-semibold text-sm mb-6 transition-colors duration-300"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600 mb-2">
              OwnShoe Admin
            </p>

            <h1 className="text-3xl sm:text-4xl font-black text-black">
              Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Manage your store, products and orders.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-black text-white font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {/* SALES */}

          <div className="bg-black text-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-300">Delivered Sales</p>

                <h2 className="text-3xl font-black mt-2 break-words">
                  {formatCurrency(deliveredSales)}
                </h2>

                <p className="text-xs text-gray-300 mt-2">
                  From delivered orders
                </p>
              </div>

              <div className="w-12 h-12 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                <IndianRupee size={23} />
              </div>
            </div>
          </div>

          {/* ORDERS */}

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>

                <h2 className="text-3xl font-black text-black mt-2">
                  {totalOrders}
                </h2>

                <p className="text-xs text-gray-600 mt-2">
                  All customer orders
                </p>
              </div>

              <div className="w-12 h-12 shrink-0 rounded-xl bg-red-50 flex items-center justify-center">
                <ShoppingCart size={23} className="text-red-600" />
              </div>
            </div>
          </div>

          {/* PRODUCTS */}

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>

                <h2 className="text-3xl font-black text-black mt-2">
                  {totalProducts}
                </h2>

                <p className="text-xs text-gray-600 mt-2">Products in store</p>
              </div>

              <div className="w-12 h-12 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center">
                <Package size={23} className="text-black" />
              </div>
            </div>
          </div>

          {/* CUSTOMERS */}

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Customers</p>

                <h2 className="text-3xl font-black text-black mt-2">
                  {totalCustomers}
                </h2>

                <p className="text-xs text-gray-600 mt-2">
                  Registered or identified customers
                </p>
              </div>

              <div className="w-12 h-12 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center">
                <Users size={23} className="text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* ORDER OVERVIEW */}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-black text-black">Order Overview</h2>

              <p className="text-sm text-gray-600 mt-1">
                Current order status summary
              </p>
            </div>

            <TrendingUp size={24} className="text-red-600 shrink-0" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* PENDING */}

            <div className="rounded-xl bg-orange-50 p-4">
              <div className="flex items-center gap-3">
                <Clock3 size={21} className="text-orange-600 shrink-0" />

                <div>
                  <p className="text-xs text-orange-800">Pending</p>

                  <p className="text-xl font-black text-orange-900">
                    {pendingOrders}
                  </p>
                </div>
              </div>
            </div>

            {/* PROCESSING */}

            <div className="rounded-xl bg-yellow-50 p-4">
              <div className="flex items-center gap-3">
                <Package size={21} className="text-yellow-700 shrink-0" />

                <div>
                  <p className="text-xs text-yellow-800">Processing</p>

                  <p className="text-xl font-black text-yellow-900">
                    {processingOrders}
                  </p>
                </div>
              </div>
            </div>

            {/* SHIPPED */}

            <div className="rounded-xl bg-purple-50 p-4">
              <div className="flex items-center gap-3">
                <Truck size={21} className="text-purple-600 shrink-0" />

                <div>
                  <p className="text-xs text-purple-800">Shipped</p>

                  <p className="text-xl font-black text-purple-900">
                    {shippedOrders}
                  </p>
                </div>
              </div>
            </div>

            {/* DELIVERED */}

            <div className="rounded-xl bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={21} className="text-green-600 shrink-0" />

                <div>
                  <p className="text-xs text-green-800">Delivered</p>

                  <p className="text-xl font-black text-green-900">
                    {deliveredOrders}
                  </p>
                </div>
              </div>
            </div>

            {/* CANCELLED */}

            <div className="rounded-xl bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <XCircle size={21} className="text-red-600 shrink-0" />

                <div>
                  <p className="text-xs text-red-800">Cancelled</p>

                  <p className="text-xl font-black text-red-900">
                    {cancelledOrders}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* MANAGE PRODUCTS */}

         <Link
  to="/admin/products"
  className="group block rounded-2xl bg-black p-6 text-white transition-colors duration-300 hover:bg-red-600 hover:text-white"
>
  <div className="flex items-center justify-between gap-4">
    <div>
      <Package
        size={26}
        className="text-white transition-colors duration-300"
      />

      <h3 className="mt-4 text-lg font-bold text-white">
        Manage Products
      </h3>

      <p className="mt-1 text-sm text-gray-300 transition-colors duration-300 group-hover:text-white">
        Add, edit and manage your shoes.
      </p>
    </div>

    <ArrowRight
      size={22}
      className="shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1"
    />
  </div>
</Link>

          {/* MANAGE ORDERS */}

          <Link
            to="/admin/orders"
            className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-red-500 hover:bg-red-50 transition-colors duration-300"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <ShoppingCart size={26} className="text-black" />

                <h3 className="font-bold text-lg mt-4 text-black">
                  Manage Orders
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  View and update customer orders.
                </p>
              </div>

              <ArrowRight
                size={22}
                className="shrink-0 text-black group-hover:translate-x-1 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* MANAGE CUSTOMERS */}

          <Link
            to="/admin/users"
            className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-red-500 hover:bg-red-50 transition-colors duration-300"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <Users size={26} className="text-black" />

                <h3 className="font-bold text-lg mt-4 text-black">
                  Manage Customers
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  View customer information.
                </p>
              </div>

              <ArrowRight
                size={22}
                className="shrink-0 text-black group-hover:translate-x-1 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>

        {/* RECENT ORDERS */}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-black">Recent Orders</h2>

              <p className="text-sm text-gray-600 mt-1">
                Latest customer purchases
              </p>
            </div>

            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 text-black hover:text-red-600 font-semibold text-sm transition-colors duration-300"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <ShoppingCart size={42} className="mx-auto text-gray-400 mb-4" />

              <p className="font-semibold text-gray-700">No orders yet</p>

              <p className="text-sm text-gray-500 mt-1">
                New orders will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentOrders.map((order) => {
                const customer = order.customer || order.user || {};

                const customerName =
                  customer.name ||
                  order.shippingAddress?.fullName ||
                  order.shippingAddress?.name ||
                  "Customer";

                const itemCount = Array.isArray(order.items)
                  ? order.items.reduce(
                      (total, item) => total + Number(item.quantity || 1),
                      0,
                    )
                  : 0;

                const status = String(
                  order.orderStatus || "unknown",
                ).toLowerCase();

                return (
                  <div
                    key={order._id}
                    className="p-5 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* CUSTOMER */}

                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-bold">
                          {customerName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-black truncate">
                            {customerName}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            Order #
                            {String(order._id || "")
                              .slice(-8)
                              .toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* ORDER INFORMATION */}

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                        <div>
                          <p className="text-xs text-gray-500">Date</p>

                          <p className="text-sm font-semibold text-black mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Items</p>

                          <p className="text-sm font-semibold text-black mt-1">
                            {itemCount}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Amount</p>

                          <p className="text-sm font-bold text-black mt-1">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold capitalize ${getStatusStyle(
                            status,
                          )}`}
                        >
                          {status.replace(/_/g, " ")}
                        </span>

                       <Link
  to="/admin/orders"
  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-black text-sm font-semibold hover:bg-black hover:!text-white transition-colors duration-300"
>
  View
</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">OwnShoe Admin Dashboard</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
