
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  ShoppingBag,
  Check,
  X,
  Minus,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <rect width="500" height="500" fill="#f3f3f3"/>
      <g fill="none" stroke="#bdbdbd" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M100 300 L160 300 L210 235 L260 275 L350 300 Q385 310 385 345 L115 345 Q95 345 100 325 Z"/>
        <path d="M115 345 L385 345"/>
        <path d="M215 260 L250 290 M240 270 L275 300 M265 282 L300 305"/>
      </g>
      <text x="250" y="400" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#333">OwnShoe</text>
      <text x="250" y="430" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#777">Image unavailable</text>
    </svg>
  `);

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imageSrc, setImageSrc] = useState(
    product?.images?.[0] || FALLBACK_IMAGE
  );

  // Update image when the product changes
  useEffect(() => {
    setImageSrc(product?.images?.[0] || FALLBACK_IMAGE);
  }, [product?._id, product?.images?.[0]]);

  // Prevent broken or blocked external images from breaking the card
  const handleImageError = () => {
    setImageSrc((current) =>
      current === FALLBACK_IMAGE ? current : FALLBACK_IMAGE
    );
  };

  const originalPrice = Number(product?.price || 0);

  const salePrice =
    product?.discountPrice &&
    Number(product.discountPrice) < originalPrice
      ? Number(product.discountPrice)
      : originalPrice;

  const discount = originalPrice
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  const hasDiscount = salePrice < originalPrice;
  const stock = Number(product?.stock || 0);
  const sizes = product?.sizes || [];

  // Check wishlist
  useEffect(() => {
    try {
      const wishlist = JSON.parse(
        localStorage.getItem("ownshoe-wishlist") || "[]"
      );

      setIsWishlisted(
        wishlist.some((item) => item._id === product?._id)
      );
    } catch (error) {
      console.error("Failed to read wishlist:", error);
      setIsWishlisted(false);
    }
  }, [product?._id]);

  // Keep wishlist synced with other components
  useEffect(() => {
    const updateWishlist = () => {
      try {
        const wishlist = JSON.parse(
          localStorage.getItem("ownshoe-wishlist") || "[]"
        );

        setIsWishlisted(
          wishlist.some((item) => item._id === product?._id)
        );
      } catch (error) {
        console.error("Failed to update wishlist:", error);
      }
    };

    window.addEventListener("wishlistUpdated", updateWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", updateWishlist);
    };
  }, [product?._id]);

  // Add product to cart
  const addToCart = (size) => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("ownshoe-cart") || "[]"
      );

      const index = cart.findIndex(
        (item) =>
          item._id === product._id &&
          String(item.selectedSize || "") === String(size || "")
      );

      if (index !== -1) {
        const existingQuantity = Number(cart[index].quantity || 1);
        const newQuantity = existingQuantity + quantity;

        if (newQuantity > stock) {
          alert(`Only ${stock} items are available.`);
          return;
        }

        cart[index].quantity = newQuantity;
      } else {
        if (quantity > stock) {
          alert(`Only ${stock} items are available.`);
          return;
        }

        cart.push({
          ...product,
          price: salePrice,
          originalPrice,
          discountPrice: salePrice,
          quantity,
          selectedSize: size || null,
        });
      }

      localStorage.setItem("ownshoe-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));

      setJustAdded(true);

      setTimeout(() => {
        setJustAdded(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      alert("Unable to add this product to your cart. Please try again.");
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (stock <= 0) return;

    if (sizes.length > 0) {
      setShowSizeModal(true);
      setSelectedSize("");
      setQuantity(1);
      return;
    }

    addToCart(null);
  };

  const handleConfirmAdd = () => {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }

    addToCart(selectedSize);
    setShowSizeModal(false);
    setSelectedSize("");
    setQuantity(1);
  };

  // Add or remove product from wishlist
  const handleWishlist = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const wishlist = JSON.parse(
        localStorage.getItem("ownshoe-wishlist") || "[]"
      );

      const found = wishlist.some((item) => item._id === product._id);

      const updatedWishlist = found
        ? wishlist.filter((item) => item._id !== product._id)
        : [...wishlist, product];

      localStorage.setItem(
        "ownshoe-wishlist",
        JSON.stringify(updatedWishlist)
      );

      setIsWishlisted(!found);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      alert("Unable to update wishlist. Please try again.");
    }
  };

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-black hover:shadow-xl">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Link to={`/product/${product._id}`}>
            <img
              src={imageSrc}
              alt={product.name || "OwnShoe product"}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              onError={handleImageError}
            />
          </Link>

          {product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              New
            </span>
          )}

          {product.isBestSeller && !product.isNew && (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              Best Seller
            </span>
          )}

          {hasDiscount && (
            <span className="absolute bottom-3 left-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
              {discount}% OFF
            </span>
          )}

          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition ${
              isWishlisted
                ? "text-red-600"
                : "text-gray-700 hover:bg-black hover:text-white"
            }`}
          >
            <Heart
              size={19}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>

          {stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {product.brand || "OwnShoe"}
            </p>

            <div className="flex items-center gap-1 text-sm">
              <Star
                size={14}
                fill="currentColor"
                className="text-yellow-500"
              />
              {Number(product.rating || 0).toFixed(1)}
            </div>
          </div>

          <Link to={`/product/${product._id}`}>
            <h3 className="mb-3 line-clamp-2 min-h-[48px] font-semibold text-gray-900 hover:text-red-600">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg font-bold text-black">
              ₹{salePrice.toLocaleString("en-IN")}
            </span>

            {hasDiscount && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>

                <span className="text-xs font-bold text-red-600">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={stock <= 0 || justAdded}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
              stock <= 0
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : justAdded
                ? "bg-black text-white"
                : "bg-black text-white hover:bg-red-600"
            }`}
          >
            {stock <= 0 ? (
              "Out of Stock"
            ) : justAdded ? (
              <>
                <Check size={17} />
                Added
              </>
            ) : (
              <>
                <ShoppingBag size={17} />
                Add to Bag
              </>
            )}
          </button>
        </div>
      </div>

      {/* Size Selection Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowSizeModal(false)}
              aria-label="Close size selection"
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-black hover:text-white"
            >
              <X size={18} />
            </button>

            <h2 className="pr-8 text-xl font-bold">Select Size</h2>
            <p className="mt-1 text-sm text-gray-500">{product.name}</p>

            {/* Sizes */}
            <div className="mt-6 grid grid-cols-4 gap-3">
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-xl border py-3 text-sm font-bold ${
                    String(selectedSize) === String(size)
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Quantity</p>

              <div className="flex w-fit items-center rounded-xl border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>

                <span className="w-10 text-center font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(stock, q + 1))
                  }
                  disabled={quantity >= stock}
                  aria-label="Increase quantity"
                  className="p-3 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-100 p-4">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-bold">
                ₹{(salePrice * quantity).toLocaleString("en-IN")}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={!selectedSize}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold ${
                selectedSize
                  ? "bg-black text-white hover:bg-red-600"
                  : "cursor-not-allowed bg-gray-200 text-gray-500"
              }`}
            >
              <ShoppingBag size={18} />
              Add to Bag
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
