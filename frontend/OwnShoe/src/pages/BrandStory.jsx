import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Award, Heart, ShieldCheck, Sparkles } from "lucide-react";

const BrandStory = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium transition hover:text-red-600"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </div>

      <section className="bg-black px-6 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
              The OwnShoe Story
            </p>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Made for those
              <span className="block text-red-500">who move their own way.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
              OwnShoe was created with one simple idea — footwear should feel
              personal. Every pair is designed to bring together everyday
              comfort, confident style and a distinct identity.
            </p>

            <button
              onClick={() => navigate("/shop")}
              className="mt-8 inline-flex items-center gap-3 bg-red-600 px-7 py-4 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Explore Collection
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
<section className="px-6 py-20 md:py-28">
  <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
    <div>
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-red-600">
        Why OwnShoe
      </p>

      <h2 className="text-4xl font-black tracking-tight md:text-5xl">
        Your shoes.
        <br />
        Your identity.
      </h2>

      <p className="mt-6 max-w-xl leading-7 text-black/60">
        We believe the right pair of shoes can change the way you walk,
        feel and express yourself. OwnShoe brings together comfort,
        confidence and modern design for everyday movement.
      </p>

      <p className="mt-5 max-w-xl leading-7 text-black/60">
        From everyday sneakers to performance-inspired designs and
        timeless classics, every collection is created for people who
        want their footwear to feel as individual as they are.
      </p>

      <div className="mt-8 flex gap-8 border-t border-black/10 pt-7">
        <div>
          <p className="text-2xl font-black">100%</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-black/50">
            Authentic
          </p>
        </div>

        <div>
          <p className="text-2xl font-black">12+</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-black/50">
            Categories
          </p>
        </div>

        <div>
          <p className="text-2xl font-black">24/7</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-black/50">
            Online Store
          </p>
        </div>
      </div>
    </div>

    <div className="relative overflow-hidden bg-[#f5f5f5] p-8 md:p-12">
      <div className="absolute right-6 top-6 z-10 bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
        Own Your Style
      </div>

      <div className="flex min-h-[420px] items-center justify-center">
        <img
          src="Logo.png"
          alt="OwnShoe footwear"
          className="w-full max-w-lg object-contain drop-shadow-2xl"
        />
      </div>

      <div className="absolute bottom-6 left-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
          OwnShoe Collection
        </p>

        <p className="mt-1 text-xl font-black">
          Designed to be yours.
        </p>
      </div>
    </div>
  </div>
</section>

      <section className="border-y border-black/10 bg-[#fafafa] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-red-600">
              What We Stand For
            </p>

            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Built around the things that matter.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="border border-black/10 bg-white p-7">
              <Sparkles size={28} className="mb-8 text-red-600" />
              <h3 className="text-xl font-bold">Distinct Style</h3>
              <p className="mt-3 text-sm leading-6 text-black/55">
                Designs that help you create your own look instead of simply
                following every trend.
              </p>
            </div>

            <div className="border border-black/10 bg-white p-7">
              <Heart size={28} className="mb-8 text-red-600" />
              <h3 className="text-xl font-bold">Everyday Comfort</h3>
              <p className="mt-3 text-sm leading-6 text-black/55">
                Footwear designed with everyday movement and comfort in mind.
              </p>
            </div>

            <div className="border border-black/10 bg-white p-7">
              <ShieldCheck size={28} className="mb-8 text-red-600" />
              <h3 className="text-xl font-bold">Quality First</h3>
              <p className="mt-3 text-sm leading-6 text-black/55">
                We focus on dependable materials, thoughtful details and
                lasting everyday use.
              </p>
            </div>

            <div className="border border-black/10 bg-white p-7">
              <Award size={28} className="mb-8 text-red-600" />
              <h3 className="text-xl font-bold">Own Your Way</h3>
              <p className="mt-3 text-sm leading-6 text-black/55">
                Because your footwear should reflect your personality, not
                someone else's.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-red-600 px-6 py-20 text-white md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/80">
            Step Into OwnShoe
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">
            Find the pair that feels like you.
          </h2>

          <button
            onClick={() => navigate("/shop")}
            className="mt-8 inline-flex items-center gap-3 bg-black px-8 py-4 text-sm font-bold text-white transition hover:bg-white hover:text-black"
          >
            Shop Now
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default BrandStory;