import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpScreen, setOtpScreen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [timer, setTimer] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // OTP RESEND TIMER
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // FORM CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // REGISTER - SEND OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setOtpScreen(true);
      setOtp("");
      setTimer(60);

      setSuccess(
        response.data.message || "OTP sent successfully to your email.",
      );
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // VERIFY SIGNUP OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/verify-signup-otp", {
        email: formData.email.trim(),
        otp,
      });

      const data = response.data;

      if (!data.user || !data.token) {
        setError("Authentication details were not received.");
        return;
      }

      login(data.user, data.token);

      setSuccess("Email verified! Account created successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 700);
    } catch (err) {
      console.error("OTP verification error:", err);

      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResendOTP = async () => {
    if (timer > 0 || resendLoading || loading) return;

    setError("");
    setSuccess("");

    try {
      setResendLoading(true);

      const response = await api.post("/api/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setOtp("");
      setTimer(60);

      setSuccess(
        response.data.message || "A new OTP has been sent to your email.",
      );
    } catch (err) {
      console.error("Resend OTP error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to resend OTP. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  // BACK TO REGISTER
  const handleBack = () => {
    setOtpScreen(false);
    setOtp("");
    setTimer(0);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-[450px] h-[450px] rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] rounded-full bg-black/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[1050px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-lg shadow-lg">
              O
            </span>

            <span className="text-2xl font-black tracking-tight text-gray-950">
              OwnShoe
            </span>
          </Link>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT PANEL */}
          <div className="hidden lg:flex relative overflow-hidden rounded-[30px] bg-black text-white min-h-[650px] p-10 flex-col justify-between shadow-2xl">
            <div className="absolute -right-28 -top-28 w-80 h-80 rounded-full bg-red-600/80" />

            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-red-600/20 blur-3xl" />

            <div className="absolute right-10 bottom-10 w-40 h-40 rounded-full border-[30px] border-white/[0.04]" />

            {/* Content */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-xs font-bold text-white">
                <Sparkles size={14} className="text-red-500" />

                {otpScreen ? "Email Verification" : "Join OwnShoe"}
              </div>

              <h1 className="text-5xl font-black tracking-[-0.05em] mt-8 leading-[1.05]">
                Step into
                <br />
                your <span className="text-red-600">style.</span>
                <br />
                Own it.
              </h1>

              <p className="mt-6 text-sm text-gray-400 leading-relaxed max-w-sm">
                {otpScreen
                  ? "One last step! Verify your email address to activate your OwnShoe account."
                  : "Create your OwnShoe account and build your personal sneaker collection."}
              </p>
            </div>

            {/* Bottom Feature */}
            <div className="relative">
              <div className="glass-dark rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={21} />
                  </div>

                  <div>
                    <p className="font-bold text-sm text-white">
                      Secure Account
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Your personal information stays protected.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-5">
                100% Authentic Footwear
              </p>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="glass rounded-[30px] p-6 sm:p-8 lg:p-10 shadow-2xl">
            {/* Heading */}
            <div className="mb-7">
              <p className="text-[10px] uppercase tracking-[0.22em] font-black text-red-600 mb-2">
                {otpScreen ? "Email Verification" : "New Member"}
              </p>

              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-gray-950">
                {otpScreen ? (
                  <>
                    Verify Email<span className="text-red-600">.</span>
                  </>
                ) : (
                  <>
                    Create Account<span className="text-red-600">.</span>
                  </>
                )}
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                {otpScreen
                  ? `Enter the 6-digit OTP sent to ${formData.email}`
                  : "Join OwnShoe and start your sneaker journey."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50/80 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 rounded-xl bg-green-50/80 border border-green-100 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* OTP SCREEN */}
            {otpScreen ? (
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
                {/* Email Icon */}
                <div className="flex flex-col items-center py-5">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-5">
                    <Mail size={30} />
                  </div>

                  <p className="text-sm font-bold text-gray-800">
                    Check your inbox
                  </p>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    We've sent a verification code to your email address.
                  </p>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Enter 6-Digit OTP
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full h-14 px-4 rounded-xl bg-white/65 border border-black/10 outline-none text-center text-2xl font-black tracking-[0.5em] text-gray-950 placeholder:text-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 rounded-full bg-black !text-white hover:bg-red-600 hover:!text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Email"}

                  {!loading && <ShieldCheck size={17} />}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Didn't receive the OTP?
                  </p>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading || timer > 0 || loading}
                    className="mt-2 text-sm font-bold text-red-600 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading
                      ? "Sending..."
                      : timer > 0
                        ? `Resend OTP in ${timer}s`
                        : "Resend OTP"}
                  </button>
                </div>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading || resendLoading}
                  className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors disabled:opacity-50"
                >
                  <ArrowLeft size={16} />
                  Back to Registration
                </button>
              </form>
            ) : (
              /* REGISTER SCREEN */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full h-12 px-4 rounded-xl bg-white/65 border border-black/10 outline-none text-sm text-gray-950 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full h-12 px-4 rounded-xl bg-white/65 border border-black/10 outline-none text-sm text-gray-950 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      className="w-full h-12 px-4 pr-12 rounded-xl bg-white/65 border border-black/10 outline-none text-sm text-gray-950 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-black hover:bg-black/5 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className="w-full h-12 px-4 pr-12 rounded-xl bg-white/65 border border-black/10 outline-none text-sm text-gray-950 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-black hover:bg-black/5 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-12 rounded-full bg-black !text-white hover:bg-red-600 hover:!text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP..." : "Create Account"}

                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>
            )}

            {/* Login */}
            {!otpScreen && (
              <div className="mt-7 pt-6 border-t border-black/10">
                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-gray-950 hover:text-red-600 transition-colors"
                  >
                    Login
                  </Link>
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-400 font-bold">
              <ShieldCheck size={13} />
              Secure Account
            </div>
          </div>
        </div>

        {/* Bottom */}
        <p className="text-center text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mt-7">
          OwnShoe — Own Your Style.
        </p>
      </div>
    </div>
  );
}

export default Register;
