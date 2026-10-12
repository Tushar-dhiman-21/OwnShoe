import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import {
  Users,
  Mail,
  Calendar,
  ShieldCheck,
  RefreshCw,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const API_URL = API_BASE_URL;

const AdminUsers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/users/customers`
      );

      setCustomers(response.data.customers || []);
    } catch (err) {
      console.error("Fetch customers error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(searchText) ||
      customer.email?.toLowerCase().includes(searchText)
    );
  });

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Users
                size={20}
                className="text-[#ac3400]"
              />

              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#ac3400]">
                Customers
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              Manage Customers
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View all registered OwnShoe customers.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCustomers}
            disabled={loading}
            className="flex w-fit items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#ac3400] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* TOTAL CUSTOMERS */}
          <div className="rounded-xl border border-[#e1e3e4] bg-white p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              <Users size={18} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Customers
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-black">
              {customers.length}
            </h2>
          </div>

          {/* SEARCH RESULT */}
          <div className="rounded-xl border border-[#e1e3e4] bg-white p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0eb] text-[#ac3400]">
              <ShieldCheck size={18} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Matching Customers
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-black">
              {filteredCustomers.length}
            </h2>
          </div>

        </div>

        {/* SEARCH */}
        <div className="mb-5 flex w-full items-center gap-3 rounded-xl border border-[#e1e3e4] bg-white px-4 py-3">

          <Search
            size={18}
            className="shrink-0 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search customer by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-400"
          />

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* CUSTOMER TABLE */}
        <div className="overflow-hidden rounded-xl border border-[#e1e3e4] bg-white">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px] border-collapse">

              <thead>
                <tr className="border-b border-[#e1e3e4] bg-[#f8f9fa]">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Joined
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {/* LOADING */}
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-14 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">

                        <RefreshCw
                          size={24}
                          className="animate-spin text-[#ac3400]"
                        />

                        <p className="text-sm text-gray-500">
                          Loading customers...
                        </p>

                      </div>
                    </td>
                  </tr>

                ) : filteredCustomers.length === 0 ? (

                  /* EMPTY */
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-14 text-center"
                    >

                      <Users
                        size={35}
                        className="mx-auto mb-3 text-gray-300"
                      />

                      <p className="font-semibold text-gray-700">
                        No customers found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Try another search.
                      </p>

                    </td>
                  </tr>

                ) : (

                  /* CUSTOMERS */
                  filteredCustomers.map((customer) => (

                    <tr
                      key={customer._id}
                      className="border-b border-[#eeeeee] last:border-b-0 hover:bg-[#fafafa]"
                    >

                      {/* CUSTOMER */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                            {customer.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div>

                            <p className="font-bold text-gray-900">
                              {customer.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              Customer
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <Mail
                            size={15}
                            className="shrink-0 text-gray-400"
                          />

                          {customer.email}

                        </div>

                      </td>

                      {/* ROLE */}
                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold capitalize text-gray-700">

                          <ShieldCheck size={13} />

                          {customer.role}

                        </span>

                      </td>

                      {/* JOINED */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <Calendar
                            size={15}
                            className="text-gray-400"
                          />

                          {formatDate(customer.createdAt)}

                        </div>

                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">

                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                          Active

                        </span>

                      </td>

                    </tr>

                  ))
                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* MOBILE TABLE MESSAGE */}
        <p className="mt-3 text-center text-xs text-gray-400 sm:hidden">
          Swipe left/right to view the complete customer table.
        </p>

      </div>
    </div>
  );
};

export default AdminUsers;