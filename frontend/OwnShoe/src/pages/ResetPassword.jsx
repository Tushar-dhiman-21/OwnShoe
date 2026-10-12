import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import axios from "axios";
import { api } from "../api";

const ResetPassword = () => {
  const navigate = useNavigate();

  const email = sessionStorage.getItem("resetEmail");
  const otp = sessionStorage.getItem("resetOTP");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !otp) {
      setError("Reset session expired. Please start again.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/reset-password", {
          email,
          otp,
          newPassword,
        }
      );

      if (response.data.success) {
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetOTP");

        navigate("/login");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] relative overflow-hidden flex items-center justify-center px-4 py-10">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-black/10 blur-3xl pointer-events-none" />

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="relative w-full max-w-[1050px]">

        {/* =====================================================
            LOGO
        ===================================================== */}

        <div className="flex justify-center mb-8">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2"
          >
            <span className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-lg shadow-lg">
              O
            </span>

            <span className="text-2xl font-black tracking-tight text-gray-950">
              OwnShoe
            </span>
          </button>

        </div>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* =====================================================
              LEFT PANEL
          ===================================================== */}

          <div className="hidden lg:flex relative overflow-hidden rounded-[30px] bg-black text-white min-h-[620px] p-10 flex-col justify-between shadow-2xl">

            {/* Glow */}

            <div className="absolute -right-28 -top-28 w-80 h-80 rounded-full bg-red-600/80 blur-sm" />

            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-red-600/20 blur-3xl" />

            <div className="absolute right-10 bottom-10 w-40 h-40 rounded-full border-[30px] border-white/[0.04]" />

            {/* Content */}

            <div className="relative">

              {/* Badge */}

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/10 text-xs font-bold">

                <Sparkles
                  size={14}
                  className="text-red-500"
                />

                Password Recovery

              </div>

              {/* Heading */}

              <h1 className="text-5xl font-black tracking-[-0.05em] mt-8 leading-[1.05]">

                Create a
                <br />

                <span className="text-red-600">
                  new password.
                </span>

                <br />

                You're secure.

              </h1>

              <p className="mt-6 text-sm text-gray-400 leading-relaxed max-w-sm">

                Your identity has been verified.
                Create a strong new password to
                secure your OwnShoe account.

              </p>

            </div>

            {/* Security Card */}

            <div className="relative">

              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5">

                <div className="flex items-center gap-4">

                  <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shrink-0">

                    <ShieldCheck size={21} />

                  </div>

                  <div>

                    <p className="font-bold text-sm text-white">
                      Account Protected
                    </p>

                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Your new password will be securely
                      encrypted before being saved.
                    </p>

                  </div>

                </div>

              </div>

              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-5">
                100% Authentic Footwear
              </p>

            </div>

          </div>

          {/* =====================================================
              RIGHT CARD
          ===================================================== */}

          <div className="relative bg-white/80 backdrop-blur-xl border border-white/80 rounded-[30px] p-6 sm:p-8 lg:p-10 shadow-2xl">

            {/* Back Button */}

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-8"
            >

              <ArrowLeft size={17} />

              Back

            </button>

            {/* Icon */}

            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl mb-7 relative">

              <Lock size={27} />

              <div className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">

                <KeyRound size={12} />

              </div>

            </div>

            {/* Heading */}

            <div className="mb-8">

              <p className="text-[10px] uppercase tracking-[0.22em] font-black text-red-600 mb-2">
                Final Step
              </p>

              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-gray-950">

                New Password
                <span className="text-red-600">
                  .
                </span>

              </h2>

              <p className="text-sm text-gray-500 mt-3 leading-relaxed">

                Create a new password for your OwnShoe
                account. Make sure it's at least 6 characters.

              </p>

            </div>

            {/* Email */}

            {email && (

              <div className="mb-6 rounded-2xl bg-gray-50 border border-black/5 px-4 py-3">

                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                  Account
                </p>

                <p className="text-sm font-bold text-gray-900 truncate mt-1">
                  {email}
                </p>

              </div>

            )}

            {/* Error */}

            {error && (

              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">

                {error}

              </div>

            )}

            {/* =====================================================
                FORM
            ===================================================== */}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >

              {/* New Password */}

              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  New Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full h-13 pl-11 pr-12 rounded-xl bg-white border border-black/10 outline-none text-sm text-gray-950 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
                  >

                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}

                  </button>

                </div>

              </div>

              {/* Confirm Password */}

              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Confirm Password
                </label>

                <div className="relative">

                  <CheckCircle
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full h-13 pl-11 pr-12 rounded-xl bg-white border border-black/10 outline-none text-sm text-gray-950 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
                  >

                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}

                  </button>

                </div>

              </div>

              {/* Password Requirements */}

              <div className="rounded-xl bg-gray-50 border border-black/5 p-4">

                <p className="text-[10px] uppercase tracking-wider font-black text-gray-500 mb-3">
                  Password Requirements
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">

                  <div
                    className={`flex items-center gap-2 ${
                      newPassword.length >= 6
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >

                    <CheckCircle size={14} />

                    At least 6 characters

                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      newPassword &&
                      confirmPassword &&
                      newPassword === confirmPassword
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >

                    <CheckCircle size={14} />

                    Passwords match

                  </div>

                </div>

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 rounded-full bg-black !text-white hover:bg-red-600 hover:!text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {loading ? (
                  "Resetting Password..."
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={17} />
                  </>
                )}

              </button>

            </form>

            {/* Security */}

            <div className="mt-7 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-400 font-bold">

              <ShieldCheck size={13} />

              Secure Account Recovery

            </div>

          </div>

        </div>

        {/* Footer */}

        <p className="text-center text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mt-7">

          OwnShoe — Own Your Style.

        </p>

      </div>

    </div>
  );
};

export default ResetPassword;