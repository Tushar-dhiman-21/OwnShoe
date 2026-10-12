import {
  Truck,
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";

function Features() {
  return (
    <section className="section features-section bg-[#f7f7f5]">
      <div className="container">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* ================= SHIPPING ================= */}
          <div className="group rounded-2xl border border-black/5 bg-white/65 p-5 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition-all duration-300 group-hover:bg-red-600">
              <Truck size={22} />
            </div>

            <h3 className="text-sm font-black text-gray-950">
              Free Express Shipping
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              On all orders above ₹2,000.
            </p>

          </div>

          {/* ================= PAYMENTS ================= */}
          <div className="group rounded-2xl border border-black/5 bg-white/65 p-5 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition-all duration-300 group-hover:bg-red-600">
              <ShieldCheck size={22} />
            </div>

            <h3 className="text-sm font-black text-gray-950">
              Secure Payments
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              100% secure checkout experience.
            </p>

          </div>

          {/* ================= RETURNS ================= */}
          <div className="group rounded-2xl border border-black/5 bg-white/65 p-5 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition-all duration-300 group-hover:bg-red-600">
              <RotateCcw size={22} />
            </div>

            <h3 className="text-sm font-black text-gray-950">
              Easy Returns
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Simple 7-day return policy.
            </p>

          </div>

          {/* ================= AUTHENTIC ================= */}
          <div className="group rounded-2xl border border-black/5 bg-white/65 p-5 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition-all duration-300 group-hover:bg-red-600">
              <BadgeCheck size={22} />
            </div>

            <h3 className="text-sm font-black text-gray-950">
              100% Authentic
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Every pair is verified.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Features;