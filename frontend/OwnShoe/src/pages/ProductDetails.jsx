import { useEffect, useState } from "react";

import { useParams, Link, useNavigate } from "react-router-dom";

import axios from "axios";

import {
  Heart,
  ZoomIn,
  Star,
  Verified,
  Ruler,
  Minus,
  Plus,
  ChevronDown,
  X,
  ShoppingBag,
  Flame,
  Truck,
  Sparkles,
  Recycle,
  Shirt,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const SPECS = [
  {
    icon: Sparkles,

    title: "Description & story",
  },

  {
    icon: Ruler,

    title: "Size & fit guide",

    list: [
      "Fit: Runs true to size. If you have wider feet, we advise ordering a half size up.",

      "Width: Standard D-Medium width profile.",

      "Collar: Padded low-cut collar for zero heel slippage.",
    ],
  },

  {
    icon: Recycle,

    title: "Materials & care",

    list: [
      "Upper: Breathable engineered material with synthetic overlays.",

      "Midsole: Cushioned foam designed for everyday comfort.",

      "Outsole: High-abrasion rubber for better grip.",

      "Clean: Spot clean with damp cloth and mild sneaker cleaner. Air dry away from direct heat.",
    ],
  },

  {
    icon: Truck,

    title: "Free shipping & 7-day returns",

    body: "Complimentary express courier delivery across India within 2-4 business days. Enjoy an effortless 7-day doorstep pickup and exchange policy if the fit isn't perfect.",
  },
];

export default function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeImg, setActiveImg] = useState(0);

  const [selectedSize, setSelectedSize] = useState(null);

  const [qty, setQty] = useState(1);

  const [wishlisted, setWishlisted] = useState(false);

  const [openSpec, setOpenSpec] = useState(0);

  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [toast, setToast] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);

  const [reviewText, setReviewText] = useState("");

  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [reviewError, setReviewError] = useState("");

  const [reviewSuccess, setReviewSuccess] = useState("");

  // Get product

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await axios.get(
          `http://localhost:8000/api/products/${id}`,
        );

        const data = response.data.product;

        setProduct(data);

        if (data?.sizes?.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);

        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]);

  // Get reviews

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);

      const response = await axios.get(
        `http://localhost:8000/api/reviews?product=${id}`,
      );

      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);

      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Check wishlist

  const checkWishlist = () => {
    const wishlist = JSON.parse(
      localStorage.getItem("ownshoe-wishlist") || "[]",
    );

    const found = wishlist.some((item) => item._id === product?._id);

    setWishlisted(found);
  };

  useEffect(() => {
    if (product) {
      checkWishlist();
    }
  }, [product]);

  // Sync wishlist with ProductCard/Header

  useEffect(() => {
    const updateWishlist = () => {
      checkWishlist();
    };

    window.addEventListener("wishlistUpdated", updateWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", updateWishlist);
    };
  }, [product]);

  // Wishlist

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login");

      return;
    }

    const wishlist = JSON.parse(
      localStorage.getItem("ownshoe-wishlist") || "[]",
    );

    const found = wishlist.some((item) => item._id === product._id);

    let updatedWishlist;

    if (found) {
      updatedWishlist = wishlist.filter((item) => item._id !== product._id);

      setWishlisted(false);
    } else {
      updatedWishlist = [...wishlist, product];

      setWishlisted(true);
    }

    localStorage.setItem("ownshoe-wishlist", JSON.stringify(updatedWishlist));

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // Submit review

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    setReviewError("");

    setReviewSuccess("");

    if (!isAuthenticated || !user) {
      setReviewError("Please login to write a review.");

      return;
    }

    if (!reviewRating) {
      setReviewError("Please select a rating.");

      return;
    }

    if (!reviewText.trim()) {
      setReviewError("Please write your review.");

      return;
    }

    if (reviewText.trim().length < 5) {
      setReviewError("Review must be at least 5 characters long.");

      return;
    }

    try {
      setReviewSubmitting(true);

      const response = await axios.post("http://localhost:8000/api/reviews", {
        user: user.id,

        product: product._id,

        rating: reviewRating,

        text: reviewText.trim(),
      });

      if (response.data.success) {
        setReviewSuccess("Review submitted successfully!");

        setReviewText("");

        setReviewRating(5);

        await fetchReviews();

        setTimeout(() => {
          setReviewModalOpen(false);

          setReviewSuccess("");
        }, 900);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);

      setReviewError(
        error.response?.data?.message ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 text-sm">{error || "Product not found."}</p>

        <Link
          to="/shop"
          className="px-5 py-2.5 rounded-full bg-black !text-white text-sm font-semibold"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : ["https://via.placeholder.com/600x750?text=OwnShoe"];

  const sizes =
    product.sizes?.length > 0 ? [...product.sizes].sort((a, b) => a - b) : [];

  const originalPrice = Number(product.price || 0);

  const hasDiscount =
    Number(product.discountPrice || 0) > 0 &&
    Number(product.discountPrice) < originalPrice;

  const salePrice = hasDiscount ? Number(product.discountPrice) : originalPrice;

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? (
          reviews.reduce(
            (total, review) => total + Number(review.rating || 0),

            0,
          ) / reviewCount
        ).toFixed(1)
      : Number(product.rating || 0).toFixed(1);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter(
      (review) => Number(review.rating) === star,
    ).length;

    const percentage =
      reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;

    return {
      stars: star,

      count,

      percentage,
    };
  });

  // Add product to cart

  const addToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first.");

      return false;
    }

    if (product.stock <= 0) {
      alert("This product is currently out of stock.");

      return false;
    }

    if (qty > product.stock) {
      alert(`Only ${product.stock} pairs are available.`);

      return false;
    }

    const cart = JSON.parse(localStorage.getItem("ownshoe-cart") || "[]");

    const index = cart.findIndex(
      (item) =>
        item._id === product._id &&
        String(item.selectedSize) === String(selectedSize),
    );

    if (index !== -1) {
      const newQuantity = cart[index].quantity + qty;

      if (newQuantity > product.stock) {
        alert(`Only ${product.stock} pairs are available.`);

        return false;
      }

      cart[index].quantity = newQuantity;
    } else {
      cart.push({
        ...product,

        price: salePrice,

        originalPrice,

        discountPrice: hasDiscount ? salePrice : null,

        quantity: qty,

        selectedSize,
      });
    }

    localStorage.setItem("ownshoe-cart", JSON.stringify(cart));

    window.dispatchEvent(new Event("cartUpdated"));

    return true;
  };

  // Add to cart

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");

      return;
    }

    const added = addToCart();

    if (!added) return;

    setToast(true);

    setTimeout(() => {
      setToast(false);
    }, 2200);
  };

  // Buy now

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login");

      return;
    }

    if (!selectedSize) {
      alert("Please select a size first.");

      return;
    }

    if (product.stock <= 0) {
      alert("This product is currently out of stock.");

      return;
    }

    if (qty > product.stock) {
      alert(`Only ${product.stock} pairs are available.`);

      return;
    }

    const buyNowItem = {
      ...product,

      price: salePrice,

      originalPrice,

      discountPrice: hasDiscount ? salePrice : null,

      quantity: qty,

      selectedSize,
    };

    // Checkout reads from ownshoe-cart, so save the Buy Now item there.
    // Buy Now checks out only this selected product, size, and quantity.
    localStorage.setItem("ownshoe-cart", JSON.stringify([buyNowItem]));
    sessionStorage.removeItem("ownshoe-buy-now");
    window.dispatchEvent(new Event("cartUpdated"));

    navigate("/checkout");
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6 pb-20">
        {/* Back */}

        <div className="mb-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition"
          >
            <ArrowLeft size={17} />
            Back
          </button>
        </div>

        {/* Breadcrumb */}

        <nav className="flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto no-scrollbar mb-4 lg:mb-6">
          <Link to="/" className="hover:text-black">
            Home
          </Link>

          <ChevronDown size={12} className="-rotate-90 shrink-0" />

          <Link to="/shop" className="hover:text-black">
            Shop
          </Link>

          <ChevronDown size={12} className="-rotate-90 shrink-0" />

          <span className="text-gray-900 font-semibold truncate">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT SIDE */}

          <div className="lg:sticky lg:top-6 lg:self-start flex flex-col gap-3">
            <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden group">
              {/* Badges */}

              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {product.isNew && (
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-black !text-white">
                    New arrival
                  </span>
                )}

                {product.isBestSeller && (
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-600 !text-white">
                    Best seller
                  </span>
                )}

                {hasDiscount && (
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-600 !text-white">
                    {discountPercentage}% off
                  </span>
                )}
              </div>

              {/* Buttons */}

              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={handleWishlist}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm"
                >
                  <Heart
                    size={19}
                    className={
                      wishlisted ? "fill-red-600 text-red-600" : "text-gray-800"
                    }
                  />
                </button>

                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
                  <ZoomIn size={19} className="text-gray-800" />
                </button>
              </div>

              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Thumbnails */}

            <div className="grid grid-cols-4 gap-2.5">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-square rounded-lg bg-gray-50 overflow-hidden p-1.5 border-2 ${
                    activeImg === i
                      ? "border-black"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-600 tracking-widest uppercase">
                  {product.brand}
                </span>

                {product.stock > 0 && (
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    Fast selling
                  </span>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                {product.name}
              </h1>

              {/* Rating */}

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Star size={15} className="fill-red-500 text-red-500" />

                  <span className="text-sm font-semibold">{averageRating}</span>
                </div>

                <span className="text-sm text-gray-500">
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </span>

                <span className="text-gray-300">•</span>

                <span className="text-sm font-semibold text-gray-700">
                  {product.stock} in stock
                </span>
              </div>

              {/* Price */}

              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-extrabold text-gray-900">
                  ₹{salePrice.toLocaleString("en-IN")}
                </span>

                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </span>

                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              {hasDiscount && (
                <p className="text-sm font-semibold text-green-600">
                  You save ₹
                  {(originalPrice - salePrice).toLocaleString("en-IN")}
                </p>
              )}

              <p className="text-xs text-gray-500">
                Inclusive of all applicable taxes
              </p>

              <p className="text-gray-600 leading-relaxed mt-1">
                {product.description}
              </p>
            </div>

            {/* Features */}

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                <Sparkles size={22} className="text-red-600 shrink-0" />

                <div>
                  <span className="text-sm font-bold block">Premium</span>

                  <span className="text-xs text-gray-500">
                    Quality footwear
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                <Shirt size={22} className="text-red-600 shrink-0" />

                <div>
                  <span className="text-sm font-bold block">Comfortable</span>

                  <span className="text-xs text-gray-500">Everyday fit</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                <Flame size={22} className="text-red-600 shrink-0" />

                <div>
                  <span className="text-sm font-bold block">Popular</span>

                  <span className="text-xs text-gray-500">
                    Customer favourite
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                <Truck size={22} className="text-red-600 shrink-0" />

                <div>
                  <span className="text-sm font-bold block">Fast delivery</span>

                  <span className="text-xs text-gray-500">Across India</span>
                </div>
              </div>
            </div>

            {/* Size */}

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">
                  Select size (UK/India)
                </span>

                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <Ruler size={15} />
                  Size guide
                </button>
              </div>

              {sizes.length > 0 ? (
                <div className="grid grid-cols-6 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 rounded-lg text-sm font-semibold ${
                        selectedSize === size
                          ? "bg-black !text-white"
                          : "bg-white border border-gray-200 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No sizes available.</p>
              )}

              {product.stock > 0 && product.stock <= 5 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 text-red-900">
                  <div className="flex items-center gap-2">
                    <Flame size={17} className="text-red-600" />

                    <span className="text-sm font-semibold">
                      Only {product.stock} pairs left!
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-bold bg-red-600 !text-white px-2 py-0.5 rounded-full">
                    Selling fast
                  </span>
                </div>
              )}
            </div>

            {/* Quantity */}

            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-bold">Quantity</span>

              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm"
                >
                  <Minus size={16} />
                </button>

                <span className="w-10 text-center text-sm font-semibold">
                  {qty}
                </span>

                <button
                  onClick={() =>
                    setQty((q) => Math.min(product.stock || 99, q + 1))
                  }
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Buttons */}

            <div className="hidden lg:flex items-center gap-3 pt-2">
              <button
                onClick={handleWishlist}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50"
              >
                <Heart
                  size={20}
                  className={
                    wishlisted ? "fill-red-600 text-red-600" : "text-gray-700"
                  }
                />
              </button>

              <button
                onClick={handleAddToCart}
                className="flex-1 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Add to cart
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 h-12 rounded-full bg-red-600 hover:bg-red-700 !text-white font-semibold"
              >
                Buy now
              </button>
            </div>

            {/* Specifications */}

            <div className="flex flex-col gap-2.5 pt-4">
              <h3 className="text-lg font-bold mb-1">Product specifications</h3>

              {SPECS.map((spec, i) => {
                const Icon = spec.icon;

                const open = openSpec === i;

                return (
                  <div
                    key={spec.title}
                    className="rounded-xl bg-gray-50 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenSpec(open ? -1 : i)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="flex items-center gap-2.5 text-sm font-bold">
                        <Icon size={18} className="text-red-600" />

                        {spec.title}
                      </span>

                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition ${
                          open ? "-rotate-180" : ""
                        }`}
                      />
                    </button>

                    {open && (
                      <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                        {i === 0 && <p>{product.description}</p>}

                        {spec.body && <p>{spec.body}</p>}

                        {spec.list && (
                          <ul className="space-y-1.5">
                            {spec.list.map((line) => (
                              <li key={line}>• {line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* REVIEWS */}

        <section id="reviews" className="mt-14 flex flex-col gap-4 max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Customer reviews</h3>

              <p className="text-sm text-gray-500 mt-1">
                {reviewCount}{" "}
                {reviewCount === 1 ? "customer review" : "customer reviews"}
              </p>
            </div>

            <button
              onClick={() => {
                setReviewError("");

                setReviewSuccess("");

                setReviewModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-black hover:bg-red-600 !text-white rounded-full text-sm font-semibold"
            >
              Write a review
            </button>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl flex flex-col gap-5">
            {/* Rating Summary */}

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-lg w-24 shadow-sm">
                <span className="text-3xl font-extrabold">{averageRating}</span>

                <div className="flex my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < Math.round(Number(averageRating))
                          ? "fill-red-500 text-red-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>

                <span className="text-[10px] text-gray-400 uppercase text-center">
                  Customer rating
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                {ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2">
                    <span className="text-xs w-2">{row.stars}</span>

                    <Star size={11} className="fill-red-500 text-red-500" />

                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: `${row.percentage}%`,
                        }}
                      />
                    </div>

                    <span className="text-xs text-gray-400 w-8 text-right">
                      {row.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading */}

            {reviewsLoading && (
              <div className="bg-white p-5 rounded-lg">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-32 bg-gray-200 rounded" />

                  <div className="h-3 w-full bg-gray-200 rounded" />

                  <div className="h-3 w-5/6 bg-gray-200 rounded" />
                </div>
              </div>
            )}

            {/* No reviews */}

            {!reviewsLoading && reviews.length === 0 && (
              <div className="bg-white p-6 rounded-lg text-center">
                <p className="text-sm font-semibold text-gray-700">
                  No reviews yet.
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Be the first customer to review this product.
                </p>
              </div>
            )}

            {/* Reviews */}

            {!reviewsLoading && reviews.length > 0 && (
              <div className="flex flex-col gap-3">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white p-4 rounded-lg flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-black !text-white flex items-center justify-center font-bold text-xs">
                          {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {review.user?.name || "Customer"}
                          </p>

                          <div className="flex items-center gap-1 text-green-600">
                            <Verified size={12} />

                            <span className="text-[10px] uppercase font-semibold">
                              Verified buyer
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < Number(review.rating)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 leading-6">
                      "{review.text}"
                    </p>

                    <span className="text-[11px] text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",

                        month: "short",

                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MOBILE BOTTOM BUTTONS */}

      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center gap-2 p-3 z-40"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <button
          onClick={handleWishlist}
          className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center"
        >
          <Heart
            size={18}
            className={
              wishlisted ? "fill-red-600 text-red-600" : "text-gray-700"
            }
          />
        </button>

        <button
          onClick={handleAddToCart}
          className="flex-1 h-11 rounded-full bg-gray-100 text-gray-900 text-sm font-semibold"
        >
          Add to cart
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 h-11 rounded-full bg-red-600 !text-white text-sm font-semibold"
        >
          Buy now
        </button>
      </div>

      {/* SIZE GUIDE */}

      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold">Footwear sizing chart</h4>

              <button
                onClick={() => setSizeGuideOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Measure from heel to toe along the longest point of your foot.
            </p>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 font-bold">
                  <tr>
                    <th className="p-2.5">UK/IND</th>

                    <th className="p-2.5">US</th>

                    <th className="p-2.5">EU</th>

                    <th className="p-2.5">Length</th>
                  </tr>
                </thead>

                <tbody className="text-gray-600">
                  {[
                    [6, 7, 40, "25.0 cm"],

                    [7, 8, 41, "25.5 cm"],

                    [8, 9, 42, "26.5 cm"],

                    [9, 10, 43, "27.5 cm"],

                    [10, 11, 44, "28.5 cm"],

                    [11, 12, 45, "29.5 cm"],
                  ].map((row) => (
                    <tr key={row[0]}>
                      <td className="p-2.5 font-bold">{row[0]}</td>

                      <td className="p-2.5">{row[1]}</td>

                      <td className="p-2.5">{row[2]}</td>

                      <td className="p-2.5">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setSizeGuideOpen(false)}
              className="w-full h-11 mt-5 rounded-full bg-black !text-white text-sm font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}

      {reviewModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-extrabold">Write a review</h3>

                <p className="text-xs text-gray-500 mt-1">
                  Share your experience with this product.
                </p>
              </div>

              <button
                onClick={() => {
                  setReviewModalOpen(false);

                  setReviewError("");

                  setReviewSuccess("");
                }}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="rounded-2xl bg-gray-50 p-5 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-black !text-white flex items-center justify-center">
                  <Heart size={20} />
                </div>

                <h4 className="mt-4 text-sm font-bold">Login required</h4>

                <p className="mt-1 text-xs text-gray-500">
                  Please login to your OwnShoe account before submitting a
                  review.
                </p>

                <Link
                  to="/login"
                  className="mt-4 inline-flex px-5 py-2.5 rounded-full bg-black !text-white text-sm font-semibold hover:bg-red-600"
                >
                  Login
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitReview}
                className="flex flex-col gap-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black !text-white flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      {user?.name || "Customer"}
                    </p>

                    <p className="text-xs text-gray-500">
                      Posting as your OwnShoe account
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Your rating
                  </label>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                      >
                        <Star
                          size={28}
                          className={
                            star <= reviewRating
                              ? "fill-red-500 text-red-500"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}

                    <span className="ml-2 text-sm font-semibold">
                      {reviewRating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Your review
                  </label>

                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about the fit, comfort, quality..."
                    maxLength={500}
                    rows={5}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none resize-none focus:border-black"
                  />

                  <div className="mt-1 flex justify-end">
                    <span className="text-[11px] text-gray-400">
                      {reviewText.length}/500
                    </span>
                  </div>
                </div>

                {reviewError && (
                  <div className="rounded-xl bg-red-50 px-4 py-3">
                    <p className="text-xs font-semibold text-red-600">
                      {reviewError}
                    </p>
                  </div>
                )}

                {reviewSuccess && (
                  <div className="rounded-xl bg-green-50 px-4 py-3">
                    <p className="text-xs font-semibold text-green-600">
                      {reviewSuccess}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full h-12 rounded-full bg-black hover:bg-red-600 !text-white text-sm font-bold disabled:opacity-60"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-black !text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50 flex items-center gap-2">
          <ShoppingBag size={15} />
          Added to cart — size {selectedSize}, qty {qty}
        </div>
      )}
    </div>
  );
}
