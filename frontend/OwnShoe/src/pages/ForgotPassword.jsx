import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  Sparkles,
  KeyRound,
} from "lucide-react";

import { api } from "../api";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // =====================================================
  // SEND OTP
  // POST /api/auth/forgot-password
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");


    // Check email
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }


    try {

      setLoading(true);


      const response = await api.post("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });


      if (response.data.success) {

        // Save email for OTP page
        sessionStorage.setItem(
          "resetEmail",
          email.trim().toLowerCase()
        );


        setMessage(
          response.data.message ||
          "OTP sent successfully!"
        );


        // Go to OTP page
        setTimeout(() => {
          navigate("/verify-otp");
        }, 1000);

      }

    } catch (error) {

      console.error(
        "Forgot password error:",
        error
      );


      setError(
        error.response?.data?.message ||
        "Unable to send OTP. Please try again."
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

          <Link
            to="/"
            className="inline-flex items-center gap-2"
          >

            <span className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-lg shadow-lg">
              O
            </span>

            <span className="text-2xl font-black tracking-tight text-gray-950">
              OwnShoe
            </span>

          </Link>

        </div>


        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">


          {/* =====================================================
              LEFT PANEL
          ===================================================== */}

          <div className="hidden lg:flex relative overflow-hidden rounded-[30px] bg-black text-white min-h-[590px] p-10 flex-col justify-between shadow-2xl">


            {/* Red Glow */}

            <div className="absolute -right-28 -top-28 w-80 h-80 rounded-full bg-red-600/80" />

            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-red-600/20 blur-3xl" />

            <div className="absolute right-10 bottom-10 w-40 h-40 rounded-full border-[30px] border-white/[0.04]" />


            {/* Content */}

            <div className="relative">

              {/* Badge */}

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/10 text-xs font-bold text-white">

                <Sparkles
                  size={14}
                  className="text-red-500"
                />

                Account Recovery

              </div>


              {/* Heading */}

              <h1 className="text-5xl font-black tracking-[-0.05em] mt-8 leading-[1.05]">

                Forgot your
                <br />

                <span className="text-red-600">
                  password?
                </span>

                <br />

                We've got you.

              </h1>


              <p className="mt-6 text-sm text-gray-400 leading-relaxed max-w-sm">

                Don't worry. Enter your registered email
                and we'll send you a secure OTP to reset
                your OwnShoe password.

              </p>

            </div>


            {/* Bottom Features */}

            <div className="relative">

              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5">

                <div className="flex items-center gap-4">

                  <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shrink-0">

                    <ShieldCheck size={21} />

                  </div>


                  <div>

                    <p className="font-bold text-sm text-white">
                      Secure Recovery
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Your password reset is protected
                      with a one-time verification code.
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

          <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-[30px] p-6 sm:p-8 lg:p-10 shadow-2xl">


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

              <Mail size={27} />

              <div className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">

                <KeyRound size={12} />

              </div>

            </div>


            {/* Heading */}

            <div className="mb-8">

              <p className="text-[10px] uppercase tracking-[0.22em] font-black text-red-600 mb-2">
                Account Recovery
              </p>


              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-gray-950">

                Reset Password

                <span className="text-red-600">
                  .
                </span>

              </h2>


              <p className="text-sm text-gray-500 mt-3 leading-relaxed">

                Enter the email linked to your OwnShoe
                account. We'll send you a 6-digit OTP.

              </p>

            </div>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (

              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">

                {error}

              </div>

            )}


            {/* =====================================================
                SUCCESS
            ===================================================== */}

            {message && (

              <div className="mb-5 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-600">

                {message}

              </div>

            )}


            {/* =====================================================
                FORM
            ===================================================== */}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >


              {/* Email */}

              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">

                  Email Address

                </label>


                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />


                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@gmail.com"
                    autoComplete="email"
                    className="w-full h-13 pl-11 pr-4 rounded-xl bg-white/80 border border-black/10 outline-none text-sm text-gray-950 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />

                </div>

              </div>


              {/* Send Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 rounded-full bg-black !text-white hover:bg-red-600 hover:!text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {loading ? (

                  "Sending OTP..."

                ) : (

                  <>
                    Send Verification Code
                    <ArrowRight size={17} />
                  </>

                )}

              </button>

            </form>


            {/* Divider */}

            <div className="flex items-center gap-4 my-7">

              <div className="h-px bg-black/10 flex-1" />

              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                or
              </span>

              <div className="h-px bg-black/10 flex-1" />

            </div>


            {/* Login */}

            <p className="text-center text-sm text-gray-500">

              Remember your password?{" "}

              <Link
                to="/login"
                className="font-bold text-gray-950 hover:text-red-600 transition-colors"
              >
                Back to Login
              </Link>

            </p>


            {/* Security */}

            <div className="mt-7 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-400 font-bold">

              <ShieldCheck size={13} />

              Secure Account Recovery

            </div>

          </div>

        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <p className="text-center text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mt-7">

          OwnShoe — Own Your Style.

        </p>

      </div>

    </div>
  );
}


export default ForgotPassword;