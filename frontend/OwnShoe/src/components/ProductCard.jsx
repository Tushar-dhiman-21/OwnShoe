import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, ShoppingBag, Check, X, Minus, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const image =
    product?.images?.[0] || "https://via.placeholder.com/500x500?text=OwnShoe";

  const originalPrice = Number(product?.price || 0);

  const salePrice =
    product?.discountPrice && Number(product.discountPrice) < originalPrice
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
    const wishlist = JSON.parse(
      localStorage.getItem("ownshoe-wishlist") || "[]",
    );

    const found = wishlist.some((item) => item._id === product._id);

    setIsWishlisted(found);
  }, [product._id]);

  // Keep wishlist synced with other components
  useEffect(() => {
    const updateWishlist = () => {
      const wishlist = JSON.parse(
        localStorage.getItem("ownshoe-wishlist") || "[]",
      );

      setIsWishlisted(wishlist.some((item) => item._id === product._id));
    };

    window.addEventListener("wishlistUpdated", updateWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", updateWishlist);
    };
  }, [product._id]);

  const addToCart = (size) => {
    const cart = JSON.parse(localStorage.getItem("ownshoe-cart") || "[]");

    const index = cart.findIndex(
      (item) =>
        item._id === product._id &&
        String(item.selectedSize || "") === String(size || ""),
    );

    if (index !== -1) {
      const newQuantity = cart[index].quantity + quantity;

      if (newQuantity > stock) {
        alert(`Only ${stock} items are available.`);
        return;
      }

      cart[index].quantity = newQuantity;
    } else {
      cart.push({
        ...product,
        price: salePrice,
        originalPrice: originalPrice,
        discountPrice: salePrice,
        quantity: quantity,
        selectedSize: size || null,
      });
    }

    localStorage.setItem("ownshoe-cart", JSON.stringify(cart));

    window.dispatchEvent(new Event("cartUpdated"));

    setJustAdded(true);

    setTimeout(() => {
      setJustAdded(false);
    }, 1500);
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

  const handleWishlist = () => {
    if (!user) {
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
      setIsWishlisted(false);
    } else {
      updatedWishlist = [...wishlist, product];
      setIsWishlisted(true);
    }

    localStorage.setItem("ownshoe-wishlist", JSON.stringify(updatedWishlist));

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-black hover:shadow-xl">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Link to={`/product/${product._id}`}>
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/500x500?text=OwnShoe";
              }}
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
            onClick={handleWishlist}
            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition ${
              isWishlisted
                ? "text-red-600"
                : "text-gray-700 hover:bg-black hover:text-white"
            }`}
          >
            <Heart size={19} fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {product.brand || "OwnShoe"}
            </p>

            <div className="flex items-center gap-1 text-sm">
              <Star size={14} fill="currentColor" className="text-yellow-500" />
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

      {/* Size Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowSizeModal(false)}
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
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>

                <span className="w-10 text-center font-semibold">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  className="p-3 hover:bg-gray-100"
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
