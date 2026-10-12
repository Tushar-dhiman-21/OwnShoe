import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      const data = response.data;

      // Auth Context me user + token save
      login(data.user, data.token);

      // Profile page
      navigate("/profile");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] relative overflow-hidden flex items-center justify-center px-4 py-10">

      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-[450px] h-[450px] rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] rounded-full bg-black/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[1050px]">

        {/* Logo */}
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

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Left Black Panel */}
          <div className="hidden lg:flex relative overflow-hidden rounded-[30px] bg-black text-white min-h-[590px] p-10 flex-col justify-between shadow-2xl">

            {/* Background Effects */}
            <div className="absolute -right-28 -top-28 w-80 h-80 rounded-full bg-red-600/80" />

            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-red-600/20 blur-3xl" />

            <div className="absolute right-10 bottom-10 w-40 h-40 rounded-full border-[30px] border-white/[0.04]" />

            {/* Content */}
            <div className="relative">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-xs font-bold text-white">
                <Sparkles
                  size={14}
                  className="text-red-500"
                />
                OwnShoe Member
              </div>

              <h1 className="text-5xl font-black tracking-[-0.05em] mt-8 leading-[1.05]">
                Your style.
                <br />
                Your{" "}
                <span className="text-red-600">
                  shoes.
                </span>
                <br />
                Your OwnShoe.
              </h1>

              <p className="mt-6 text-sm text-gray-400 leading-relaxed max-w-sm">
                Sign in to access your wishlist, cart
                and personalised sneaker collection.
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
                      Your account is protected with
                      secure authentication.
                    </p>
                  </div>

                </div>

              </div>

              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-5">
                100% Authentic Footwear
              </p>

            </div>
          </div>

          {/* Login Card */}
          <div className="glass rounded-[30px] p-6 sm:p-8 lg:p-10 shadow-2xl">

            {/* Heading */}
            <div className="mb-7">

              <p className="text-[10px] uppercase tracking-[0.22em] font-black text-red-600 mb-2">
                Welcome Back
              </p>

              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-gray-950">
                Login<span className="text-red-600">.</span>
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Continue your OwnShoe journey.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50/80 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >

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

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Forgot Password?
                  </Link>

                </div>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-white/65 border border-black/10 outline-none text-sm text-gray-950 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-black hover:bg-black/5 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full h-12 rounded-full bg-black !text-white hover:bg-red-600 hover:!text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Logging In..."
                  : "Login"}

                {!loading && (
                  <ArrowRight size={17} />
                )}
              </button>

            </form>

            {/* Register */}
            <div className="mt-7 pt-6 border-t border-black/10">

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="font-bold text-gray-950 hover:text-red-600 transition-colors"
                >
                  Create Account
                </Link>
              </p>

            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-400 font-bold">
              <ShieldCheck size={13} />
              Secure Login
            </div>

          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mt-7">
          OwnShoe — Own Your Style.
        </p>

      </div>
    </div>
  );
}

export default Login;