import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  ShieldCheck,
  LogOut,
  ShoppingBag,
  Heart,
  ClipboardList,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =========================
  // LOGGED OUT
  // =========================
  if (!user) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gray-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative min-h-screen flex items-center justify-center px-6 py-16">
          <div
            className="
              w-full max-w-md
              bg-white/80 backdrop-blur-xl
              border border-gray-200
              rounded-3xl
              p-8
              text-center
              shadow-xl
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-2xl
              hover:border-red-200
            "
          >
            {/* Logo */}
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg">
              <span className="!text-white text-2xl font-black">
                O
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles
                size={18}
                className="!text-red-600"
              />

              <h1 className="text-3xl font-black !text-gray-900">
                Welcome to OwnShoe
              </h1>
            </div>

            <p className="!text-gray-500 text-sm leading-6 mb-7">
              Login to access your profile, orders, wishlist and
              other account features.
            </p>

            <Link
              to="/login"
              className="
                w-full
                h-12
                rounded-xl
                bg-black
                !text-white
                flex items-center justify-center
                font-semibold
                no-underline
                transition-all duration-300
                hover:bg-red-600
                hover:!text-white
                hover:-translate-y-0.5
                hover:shadow-lg
              "
            >
              Login to Continue
            </Link>

            <Link
              to="/"
              className="
                inline-flex items-center gap-2
                mt-5
                !text-gray-500
                text-sm font-medium
                no-underline
                transition-all duration-200
                hover:!text-black
              "
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // USER INFO
  // =========================
  const fullName =
    user?.name ||
    user?.fullName ||
    "OwnShoe Customer";

  const email =
    user?.email ||
    "No email available";

  const role = isAdmin
    ? "Administrator"
    : user?.role === "admin"
      ? "Administrator"
      : "Customer";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* =========================
          BACKGROUND EFFECTS
      ========================= */}

      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-gray-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-red-50 rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* =========================
          MAIN
      ========================= */}

      <main className="relative max-w-6xl mx-auto px-5 sm:px-8 py-10 md:py-14">

        {/* =========================
            BACK HOME
        ========================= */}

        <Link
          to="/"
          className="
            inline-flex items-center gap-2
            !text-gray-500
            text-sm font-medium
            no-underline
            mb-8
            transition-all duration-200
            hover:!text-black
            hover:-translate-x-1
          "
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="!text-red-600 text-sm font-bold uppercase tracking-widest mb-2">
              Account
            </p>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight !text-gray-900">
              My Profile
              <span className="!text-red-600">.</span>
            </h1>

            <p className="!text-gray-500 mt-2">
              Manage your OwnShoe account and preferences.
            </p>
          </div>

          <div
            className="
              inline-flex items-center gap-2
              px-4 py-2
              rounded-full
              bg-red-50
              border border-red-100
              w-fit
            "
          >
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />

            <span className="!text-black-700 text-sm font-semibold">
              OwnShoe {isAdmin ? "Admin" : "Member"}  
            </span>
          </div>
        </div>

        {/* =========================
            PROFILE HERO CARD
        ========================= */}

        <section
          className="
            bg-black
            rounded-3xl
            p-6 md:p-8
            shadow-xl
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-2xl
            relative overflow-hidden
            mb-8
          "
        >
          {/* Decorative circles */}

          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-red-600/20 blur-2xl pointer-events-none" />

          <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-6">

            {/* Avatar */}

            <div
              className="
                w-24 h-24
                shrink-0
                rounded-3xl
                bg-red-600
                flex items-center justify-center
                shadow-lg
                transition-all duration-300
                hover:scale-105
              "
            >
              <span className="!text-white text-3xl font-black">
                {initials}
              </span>
            </div>

            {/* User Details */}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">

                <h2 className="text-2xl md:text-3xl font-black !text-white break-words">
                  {fullName}
                </h2>

                {isAdmin && (
                  <span
                    className="
                      inline-flex items-center gap-1.5
                      px-3 py-1
                      rounded-full
                      bg-white/10
                      border border-white/10
                    "
                  >
                    <ShieldCheck
                      size={14}
                      className="!text-white"
                    />

                    <span className="!text-white text-xs font-semibold">
                      Admin
                    </span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Mail
                  size={16}
                  className="!text-gray-300 shrink-0"
                />

                <p className="!text-gray-300 text-sm break-all">
                  {email}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">

                <div
                  className="
                    px-3 py-1.5
                    rounded-lg
                    bg-white/10
                    border border-white/10
                  "
                >
                  <span className="!text-gray-300 text-xs">
                    Account Type
                  </span>

                  <p className="!text-white text-sm font-semibold">
                    {role}
                  </p>
                </div>

                <div
                  className="
                    px-3 py-1.5
                    rounded-lg
                    bg-white/10
                    border border-white/10
                  "
                >
                  <span className="!text-gray-300 text-xs">
                    Member
                  </span>

                  <p className="!text-white text-sm font-semibold">
                    OwnShoe
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =========================
            ACCOUNT INFORMATION
        ========================= */}

        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-black !text-gray-900">
              Account Information
            </h2>

            <p className="!text-gray-500 text-sm mt-1">
              Your basic account details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* FULL NAME */}

            <div
              className="
                group
                bg-white
                border border-gray-200
                rounded-2xl
                p-5
                shadow-sm
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:border-red-200
              "
            >
              <div
                className="
                  w-11 h-11
                  rounded-xl
                  bg-red-50
                  flex items-center justify-center
                  mb-5
                  transition-all duration-300
                  group-hover:bg-red-600
                  group-hover:scale-105
                "
              >
                <UserRound
                  size={20}
                  className="
                    !text-red-600
                    transition-colors duration-300
                    group-hover:!text-white
                  "
                />
              </div>

              <p className="!text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Full Name
              </p>

              <h3 className="!text-gray-900 text-lg font-bold break-words">
                {fullName}
              </h3>
            </div>

            {/* EMAIL */}

            <div
              className="
                group
                bg-white
                border border-gray-200
                rounded-2xl
                p-5
                shadow-sm
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:border-red-200
              "
            >
              <div
                className="
                  w-11 h-11
                  rounded-xl
                  bg-red-50
                  flex items-center justify-center
                  mb-5
                  transition-all duration-300
                  group-hover:bg-red-600
                  group-hover:scale-105
                "
              >
                <Mail
                  size={20}
                  className="
                    !text-red-600
                    transition-colors duration-300
                    group-hover:!text-white
                  "
                />
              </div>

              <p className="!text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Email Address
              </p>

              <h3 className="!text-gray-900 text-lg font-bold break-all">
                {email}
              </h3>
            </div>

            {/* ACCOUNT TYPE */}

            <div
              className="
                group
                bg-white
                border border-gray-200
                rounded-2xl
                p-5
                shadow-sm
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:border-red-200
              "
            >
              <div
                className="
                  w-11 h-11
                  rounded-xl
                  bg-red-50
                  flex items-center justify-center
                  mb-5
                  transition-all duration-300
                  group-hover:bg-red-600
                  group-hover:scale-105
                "
              >
                <ShieldCheck
                  size={20}
                  className="
                    !text-red-600
                    transition-colors duration-300
                    group-hover:!text-white
                  "
                />
              </div>

              <p className="!text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Account Type
              </p>

              <h3 className="!text-gray-900 text-lg font-bold">
                {role}
              </h3>
            </div>
          </div>
        </section>

        {/* =========================
            QUICK ACCESS
        ========================= */}

        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-black !text-gray-900">
              Quick Access
            </h2>

            <p className="!text-gray-500 text-sm mt-1">
              Quickly access your orders, cart and wishlist.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 ${
              isAdmin
                ? "md:grid-cols-4"
                : "md:grid-cols-3"
            } gap-5`}
          >

            {/* =========================
                PLACED ORDERS
            ========================= */}

            <Link
              to="/orders"
              className="
                group
                bg-white
                border border-gray-200
                rounded-2xl
                p-6
                shadow-sm
                no-underline
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:bg-black
                hover:border-black
              "
            >
              <div className="flex items-center justify-between">

                <div
                  className="
                    w-12 h-12
                    rounded-xl
                    bg-red-50
                    flex items-center justify-center
                    transition-all duration-300
                    group-hover:bg-white
                    group-hover:scale-105
                  "
                >
                  <ClipboardList
                    size={21}
                    className="
                      !text-red-600
                      transition-colors duration-300
                      group-hover:!text-black
                    "
                  />
                </div>

                <ArrowUpRight
                  size={21}
                  className="
                    !text-gray-400
                    transition-all duration-300
                    group-hover:!text-white
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </div>

              <h3
                className="
                  mt-5
                  !text-gray-900
                  text-xl
                  font-bold
                  transition-colors duration-300
                  group-hover:!text-white
                "
              >
                Placed Orders
              </h3>

              <p
                className="
                  mt-1
                  !text-gray-500
                  text-sm
                  transition-colors duration-300
                  group-hover:!text-gray-300
                "
              >
                Track and view your previous orders.
              </p>
            </Link>

            {/* =========================
                MY CART
            ========================= */}

            <Link
              to="/cart"
              className="
                group
                bg-white
                border border-gray-200
                rounded-2xl
                p-6
                shadow-sm
                no-underline
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:bg-black
                hover:border-black
              "
            >
              <div className="flex items-center justify-between">

                <div
                  className="
                    w-12 h-12
                    rounded-xl
                    bg-red-50
                    flex items-center justify-center
                    transition-all duration-300
                    group-hover:bg-white
                    group-hover:scale-105
                  "
                >
                  <ShoppingBag
                    size={21}
                    className="
                      !text-red-600
                      transition-colors duration-300
                      group-hover:!text-black
                    "
                  />
                </div>

                <ArrowUpRight
                  size={21}
                  className="
                    !text-gray-400
                    transition-all duration-300
                    group-hover:!text-white
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </div>

              <h3
                className="
                  mt-5
                  !text-gray-900
                  text-xl
                  font-bold
                  transition-colors duration-300
                  group-hover:!text-white
                "
              >
                My Cart
              </h3>

              <p
                className="
                  mt-1
                  !text-gray-500
                  text-sm
                  transition-colors duration-300
                  group-hover:!text-gray-300
                "
              >
                View your selected shoes and checkout.
              </p>
            </Link>

            {/* =========================
                WISHLIST
            ========================= */}

            <Link
              to="/wishlist"
              className="
                group
                bg-white
                border border-gray-200
                rounded-2xl
                p-6
                shadow-sm
                no-underline
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:bg-black
                hover:border-black
              "
            >
              <div className="flex items-center justify-between">

                <div
                  className="
                    w-12 h-12
                    rounded-xl
                    bg-red-50
                    flex items-center justify-center
                    transition-all duration-300
                    group-hover:bg-white
                    group-hover:scale-105
                  "
                >
                  <Heart
                    size={21}
                    className="
                      !text-red-600
                      transition-all duration-300
                      group-hover:scale-110
                    "
                  />
                </div>

                <ArrowUpRight
                  size={21}
                  className="
                    !text-gray-400
                    transition-all duration-300
                    group-hover:!text-white
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </div>

              <h3
                className="
                  mt-5
                  !text-gray-900
                  text-xl
                  font-bold
                  transition-colors duration-300
                  group-hover:!text-white
                "
              >
                Wishlist
              </h3>

              <p
                className="
                  mt-1
                  !text-gray-500
                  text-sm
                  transition-colors duration-300
                  group-hover:!text-gray-300
                "
              >
                See the shoes you saved for later.
              </p>
            </Link>

            {/* =========================
                ADMIN DASHBOARD
            ========================= */}

            {isAdmin && (
              <Link
                to="/admin"
                className="
                  group
                  bg-white
                  border border-gray-200
                  rounded-2xl
                  p-6
                  shadow-sm
                  no-underline
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                  hover:bg-black
                  hover:border-black
                "
              >
                <div className="flex items-center justify-between">

                  <div
                    className="
                      w-12 h-12
                      rounded-xl
                      bg-red-50
                      flex items-center justify-center
                      transition-all duration-300
                      group-hover:bg-white
                      group-hover:scale-105
                    "
                  >
                    <ShieldCheck
                      size={21}
                      className="
                        !text-red-600
                        transition-colors duration-300
                        group-hover:!text-black
                      "
                    />
                  </div>

                  <ArrowUpRight
                    size={21}
                    className="
                      !text-gray-400
                      transition-all duration-300
                      group-hover:!text-white
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                  />
                </div>

                <h3
                  className="
                    mt-5
                    !text-gray-900
                    text-xl
                    font-bold
                    transition-colors duration-300
                    group-hover:!text-white
                  "
                >
                  Admin Dashboard
                </h3>

                <p
                  className="
                    mt-1
                    !text-gray-500
                    text-sm
                    transition-colors duration-300
                    group-hover:!text-gray-300
                  "
                >
                  Manage products, orders and your store.
                </p>
              </Link>
            )}
          </div>
        </section>

        {/* =========================
            LOGOUT
        ========================= */}

        <div className="flex justify-center md:justify-start">
          <button
            type="button"
            onClick={handleLogout}
            className="
              inline-flex items-center justify-center gap-2
              px-6
              h-12
              rounded-xl
              border border-gray-200
              bg-white
              !text-gray-900
              font-semibold
              shadow-sm
              transition-all duration-300
              hover:bg-red-600
              hover:border-red-600
              hover:!text-white
              hover:-translate-y-0.5
              hover:shadow-lg
            "
          >
            <LogOut size={18} />

            <span className="!text-inherit">
              Logout
            </span>
          </button>
        </div>

        {/* =========================
            FOOTER
        ========================= */}

        <div className="mt-12 pt-6 border-t border-gray-100">
          <p className="text-center !text-gray-400 text-xs">
            OwnShoe • Premium Footwear • Your style, your choice.
          </p>
        </div>

      </main>
    </div>
  );
}

export default Profile;