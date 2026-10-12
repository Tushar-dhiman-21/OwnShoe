import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import axios from "axios";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/reviews"
        );

        setReviews(response.data.reviews || []);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <section className="section reviews-section bg-[#f7f7f5]">
      <div className="container">

        {/* ================= HEADING ================= */}
        <div className="reviews-heading">

          <span className="section-label">
            THE OWN SHOE STANDARD
          </span>

          <h2>
            Loved by people
            <br />
            who <em>move.</em>
          </h2>

        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-black/5 bg-white/60 p-6 backdrop-blur-xl"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

                <div className="mt-6 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-4/6 animate-pulse rounded bg-gray-200" />
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />

                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-2 w-20 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* ================= EMPTY ================= */}
        {!loading && reviews.length === 0 && (
          <div className="rounded-2xl border border-black/5 bg-white/60 px-6 py-12 text-center backdrop-blur-xl">
            <p className="text-sm font-medium text-gray-500">
              No reviews available yet.
            </p>
          </div>
        )}

        {/* ================= REVIEWS ================= */}
        {!loading && reviews.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {reviews.slice(0, 3).map((review) => (
              <article
                className="
                  group
                  rounded-2xl
                  border border-black/5
                  bg-white/65
                  p-6
                  backdrop-blur-xl
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                "
                key={review._id}
              >

                {/* Stars */}
                <div className="flex items-center gap-1 text-red-600">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      fill={
                        star <= Math.round(review.rating || 5)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </div>

                {/* Review */}
                <p className="mt-5 text-sm leading-6 text-gray-600">
                  "{review.text}"
                </p>

                {/* Author */}
                <div className="mt-7 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-black !text-white">
                    {review.user?.name?.charAt(0)?.toUpperCase() ||
                      review.name?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>

                  <div className="min-w-0">

                    <strong className="block truncate text-sm font-bold text-gray-950">
                      {review.user?.name || review.name || "Customer"}
                    </strong>

                    <span className="block text-xs text-gray-500">
                      {review.isVerified
                        ? "Verified Customer"
                        : review.role || "Customer"}
                    </span>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </div>
    </section>
  );
}

export default Reviews;