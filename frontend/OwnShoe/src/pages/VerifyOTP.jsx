import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Mail,
  KeyRound,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { api } from "../api";

const VerifyOTP = () => {
  const navigate = useNavigate();

  const email = sessionStorage.getItem("resetEmail");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("Email session expired. Please try again.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

     const response = await api.post("/api/auth/verify-otp", {
  email,
  otp,
});

      if (response.data.success) {
        sessionStorage.setItem("resetOTP", otp);

        navigate("/reset-password");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);

    setOtp(value);
    setError("");
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

          <div className="hidden lg:flex relative overflow-hidden rounded-[30px] bg-black text-white min-h-[590px] p-10 flex-col justify-between shadow-2xl">

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

                Secure Verification

              </div>

              {/* Heading */}

              <h1 className="text-5xl font-black tracking-[-0.05em] mt-8 leading-[1.05]">

                Check your
                <br />

                <span className="text-red-600">
                  inbox.
                </span>

                <br />

                Almost there.

              </h1>

              <p className="mt-6 text-sm text-gray-400 leading-relaxed max-w-sm">

                We've sent a one-time verification code
                to your registered email address. Enter
                the code to continue resetting your password.

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
                      One-Time Password
                    </p>

                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Your OTP is valid for 5 minutes.
                      Never share it with anyone.
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

              <ShieldCheck size={27} />

              <div className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">

                <KeyRound size={12} />

              </div>

            </div>

            {/* Heading */}

            <div className="mb-8">

              <p className="text-[10px] uppercase tracking-[0.22em] font-black text-red-600 mb-2">
                Verification
              </p>

              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-gray-950">

                Verify OTP
                <span className="text-red-600">
                  .
                </span>

              </h2>

              <p className="text-sm text-gray-500 mt-3 leading-relaxed">

                Enter the 6-digit verification code
                sent to your email address.

              </p>

            </div>

            {/* Email Box */}

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-black/5 px-4 py-3 mb-7">

              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">

                <Mail size={17} />

              </div>

              <div className="min-w-0">

                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                  Code sent to
                </p>

                <p className="text-sm font-bold text-gray-900 truncate">
                  {email || "Email unavailable"}
                </p>

              </div>

            </div>

            {/* Error */}

            {error && (

              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">

                {error}

              </div>

            )}

            {/* =====================================================
                OTP FORM
            ===================================================== */}

            <form onSubmit={handleSubmit}>

              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
                Verification Code
              </label>

              <div
                onClick={() => inputRef.current?.focus()}
                className="relative"
              >

                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  className="w-full h-16 rounded-2xl bg-white border border-black/10 outline-none text-center text-2xl font-black tracking-[0.65em] pl-4 pr-1 text-gray-950 placeholder:text-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                />

              </div>

              {/* OTP Progress */}

              <div className="flex justify-center gap-1.5 mt-4">

                {[0, 1, 2, 3, 4, 5].map((index) => (

                  <div
                    key={index}
                    className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                      index < otp.length
                        ? "bg-red-600"
                        : "bg-gray-200"
                    }`}
                  />

                ))}

              </div>

              {/* Verify Button */}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-13 mt-7 rounded-full bg-black !text-white hover:bg-red-600 hover:!text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight size={17} />
                  </>
                )}

              </button>

            </form>

            {/* Resend */}

            <div className="flex items-center gap-4 my-7">

              <div className="h-px bg-black/10 flex-1" />

              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                Didn't receive it?
              </span>

              <div className="h-px bg-black/10 flex-1" />

            </div>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="w-full h-12 rounded-full border border-black/10 bg-white text-sm font-bold text-gray-700 hover:border-black hover:text-black transition-all"
            >
              Send OTP Again
            </button>

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

export default VerifyOTP;