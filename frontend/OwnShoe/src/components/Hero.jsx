import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="w-full bg-[#f7f7f5]">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-[550px]">

        {/* ================= LEFT - TEXT ================= */}
        <div className="relative flex items-center overflow-hidden px-6 py-10 sm:px-10 lg:px-12 xl:px-16">

          {/* Background Glow */}
          <div className="absolute -left-32 -bottom-32 h-72 w-72 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-xl">

            {/* Small Label */}
            <div className="glass glass-hover mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-[0.18em] text-gray-950">
              <span className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              NEW SEASON 2026
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-black sm:text-5xl lg:text-6xl">
              Step Into
              <span className="block text-red-600">
                Your Style.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
              Discover premium footwear designed for comfort,
              performance, and everyday style. Find the pair that
              feels made for you.
            </p>

            {/* ================= CTA BUTTONS ================= */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              {/* Primary */}
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-7 py-3.5 text-sm font-bold !text-white shadow-lg transition-all duration-300 hover:bg-red-600 hover:!text-white hover:-translate-y-0.5"
              >
                Shop Now
                <ArrowRight size={18} />
              </Link>

              {/* Secondary */}
              <Link
                to="/shop?filter=new"
className="glass glass-hover inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold !text-gray-950 hover:bg-white hover:!text-black"              >
                Explore Collection
              </Link>

            </div>

            {/* ================= STATS ================= */}
            <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-black/10 pt-5">

              {/* Rating */}
              <div>
                <div className="flex items-center gap-1">
                  <Star
                    size={16}
                    fill="currentColor"
                    strokeWidth={1.5}
                    className="text-black"
                  />

                  <span className="text-sm font-bold text-gray-950">
                    4.9/5
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Customer Rating
                </p>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-black/10" />

              {/* Customers */}
              <div>
                <p className="text-lg font-bold text-black">
                  10K+
                </p>

                <p className="text-xs text-gray-500">
                  Happy Customers
                </p>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-black/10" />

              {/* Authentic */}
              <div>
                <p className="text-lg font-bold text-black">
                  100%
                </p>

                <p className="text-xs text-gray-500">
                  Authentic
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ================= RIGHT - IMAGE ================= */}
        <div className="relative h-[400px] overflow-hidden bg-red-600 lg:h-full">

          {/* Background Glow */}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

          {/* Premium Badge */}
          <div className="glass absolute left-5 top-5 z-20 rounded-full px-4 py-2.5 text-xs font-bold tracking-wider !text-red-600 shadow-lg sm:left-7 sm:top-7">
            PREMIUM CUSHIONING
          </div>

          {/* Background Decoration */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[50px] border-white/10" />

          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border-[60px] border-white/10" />

          {/* Shoe Image */}
          <div className="relative flex h-full w-full items-center justify-center px-6 py-8 sm:px-10 lg:px-12">

            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90"
              alt="Premium OwnShoe sneaker"
              className="relative z-10 h-full w-full max-h-[460px] object-contain object-center drop-shadow-2xl"
            />

          </div>

          {/* Bottom Info */}
          <div className="glass absolute bottom-5 left-5 z-20 rounded-2xl px-4 py-3 shadow-lg sm:bottom-7 sm:left-7">

            <p className="text-xs font-medium text-gray-500">
              Featured
            </p>

            <p className="text-sm font-bold text-gray-950">
              Everyday Performance
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;