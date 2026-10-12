import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function PromoBanner() {
  return (
    <section className="section bg-[#f7f7f5]">
      <div className="container">

        <div className="relative overflow-hidden rounded-[28px] bg-black min-h-[330px] sm:min-h-[360px]">

          {/* Background Glow */}
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-red-600/70 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />

          {/* Decorative Circles */}
          <div className="absolute -right-16 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[55px] border-white/[0.04]" />

          <div className="absolute right-20 top-10 h-24 w-24 rounded-full border border-white/10" />

          {/* Content */}
          <div className="relative z-10 flex min-h-[330px] sm:min-h-[360px] items-center px-6 py-10 sm:px-10 lg:px-16">

            <div className="max-w-2xl">

              {/* Label */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                <Sparkles
                  size={14}
                  className="text-red-500"
                />

                OwnShoe Exclusive
              </div>

              {/* Heading */}
              <h2 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Step Into
                <span className="block text-red-600">
                  Something New.
                </span>
              </h2>

              {/* Description */}
              <p className="mt-5 max-w-lg text-sm leading-6 text-gray-400 sm:text-base">
                Discover fresh styles, premium comfort and
                everyday sneakers made to match your own style.
              </p>

              {/* CTA */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/shop?filter=new"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3.5 text-sm font-bold !text-white shadow-lg shadow-red-600/20 transition-all duration-300 hover:bg-white hover:!text-black hover:-translate-y-0.5"
                >
                  Explore New Arrivals
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold !text-white backdrop-blur-xl transition-all duration-300 hover:bg-white hover:!text-black hover:-translate-y-0.5"
                >
                  Shop All
                </Link>

              </div>

            </div>

          </div>

          {/* Floating Glass Card */}
          <div className="absolute right-8 bottom-8 hidden lg:block">

            <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 backdrop-blur-xl shadow-2xl">

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                OwnShoe
              </p>

              <p className="mt-1 text-xl font-black text-white">
                Own Your Style.
              </p>

              <div className="mt-3 h-1 w-12 rounded-full bg-red-600" />

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default PromoBanner;