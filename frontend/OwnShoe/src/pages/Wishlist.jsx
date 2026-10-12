import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Check,
} from "lucide-react";

import BackToHome from "../components/BackToHome";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [addedProductId, setAddedProductId] = useState(null);

  useEffect(() => {
    const loadWishlist = () => {
      const savedWishlist = JSON.parse(
        localStorage.getItem("ownshoe-wishlist") || "[]"
      );

      setWishlist(savedWishlist);
    };

    loadWishlist();

    window.addEventListener("wishlistUpdated", loadWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", loadWishlist);
    };
  }, []);

  const removeFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter(
      (item) => item._id !== id
    );

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "ownshoe-wishlist",
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addToCart = (product) => {
    try {
      const existingCart = JSON.parse(
        localStorage.getItem("ownshoe-cart") || "[]"
      );

      const existingProductIndex = existingCart.findIndex(
        (item) => item._id === product._id
      );

      if (existingProductIndex !== -1) {
        existingCart[existingProductIndex].quantity += 1;
      } else {
        existingCart.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "ownshoe-cart",
        JSON.stringify(existingCart)
      );

      setAddedProductId(product._id);

      setTimeout(() => {
        setAddedProductId(null);
      }, 1400);

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  /* ================= EMPTY WISHLIST ================= */

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f7f5]">

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8">

          {/* Top Navigation */}
          <div className="mb-8 flex items-center justify-between">
            <BackToHome />

            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
              OwnShoe / Wishlist
            </span>
          </div>

          <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">

            <div className="w-20 h-20 rounded-full bg-white/70 border border-black/5 backdrop-blur-xl shadow-sm flex items-center justify-center mb-6">
              <Heart
                size={32}
                className="text-gray-700"
              />
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900">
              Your wishlist is empty
            </h1>

            <p className="mt-2 text-sm text-gray-500 max-w-md">
              Save your favourite shoes here and come back
              whenever you're ready to grab them.
            </p>

            <Link
              to="/shop"
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                px-6
                h-11
                rounded-full
                bg-black
                !text-white
                text-sm
                font-semibold
                hover:bg-red-600
                hover:!text-white
                transition-colors
              "
            >
              <ShoppingBag size={16} />
              Explore Shoes
            </Link>

          </div>

        </div>

      </div>
    );
  }

  /* ================= WISHLIST ================= */

  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8 pb-16">

        {/* ================= TOP NAVIGATION ================= */}

        <div className="mb-8 flex items-center justify-between">
          <BackToHome />

          <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            OwnShoe / Wishlist
          </span>
        </div>

        {/* ================= HEADER ================= */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 border border-black/5 backdrop-blur-xl shadow-sm">
              <Heart
                size={22}
                className="fill-red-600 text-red-600"
              />
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
                Wishlist
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {wishlist.length}{" "}
                {wishlist.length === 1 ? "item" : "items"} saved
              </p>
            </div>

          </div>

        </div>

        {/* ================= WISHLIST GRID ================= */}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

          {wishlist.map((product) => {

            const productImage =
              product.images &&
              product.images.length > 0
                ? product.images[0]
                : "https://via.placeholder.com/500x625?text=OwnShoe";

            const isAdded =
              addedProductId === product._id;

            return (
              <article
                key={product._id}
                className="
                  group
                  w-full
                  flex
                  flex-col
                  overflow-hidden
                  rounded-2xl
                  border border-black/5
                  bg-white/70
                  backdrop-blur-xl
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                "
              >

                {/* ================= IMAGE ================= */}

                <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">

                  <Link
                    to={`/product/${product._id}`}
                    className="absolute inset-0 block"
                  >
                    <img
                      src={productImage}
                      alt={product.name}
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-105
                      "
                      loading="lazy"
                    />
                  </Link>

                  {/* Remove Wishlist */}

                  <button
                    type="button"
                    onClick={() =>
                      removeFromWishlist(product._id)
                    }
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="
                      absolute
                      top-3
                      right-3
                      z-20
                      w-9
                      h-9
                      rounded-full
                      border
                      border-white/50
                      bg-white/75
                      backdrop-blur-xl
                      shadow-lg
                      flex
                      items-center
                      justify-center
                      transition-all
                      duration-300
                      hover:bg-white
                      hover:scale-105
                      active:scale-90
                    "
                  >
                    <Heart
                      size={16}
                      className="fill-red-600 text-red-600"
                    />
                  </button>

                  {/* New Badge */}

                  {product.isNew && (
                    <span
                      className="
                        absolute
                        top-3
                        left-3
                        z-10
                        rounded-full
                        border
                        border-white/30
                        bg-red-600/90
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        !text-white
                        shadow-lg
                        backdrop-blur-md
                      "
                    >
                      New
                    </span>
                  )}

                </div>

                {/* ================= DETAILS ================= */}

                <div className="flex flex-col gap-1 p-4">

                  {/* Brand */}

                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold truncate">
                    {product.brand}
                  </span>

                  {/* Name */}

                  <Link
                    to={`/product/${product._id}`}
                  >
                    <h2 className="text-sm font-bold text-gray-900 truncate hover:text-red-600 transition-colors">
                      {product.name}
                    </h2>
                  </Link>

                  {/* Price */}

                  <span className="text-base font-extrabold text-gray-900">
                    ₹
                    {Number(
                      product.price || 0
                    ).toLocaleString("en-IN")}
                  </span>

                  {/* Add To Bag */}

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className={`
                      mt-2
                      w-full
                      h-9
                      rounded-full
                      text-xs
                      font-semibold
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      transition-all
                      duration-300
                      ${
                        isAdded
                          ? "bg-green-600 !text-white"
                          : "bg-black !text-white hover:bg-red-600 hover:!text-white"
                      }
                    `}
                  >
                    {isAdded ? (
                      <Check size={14} />
                    ) : (
                      <ShoppingBag size={14} />
                    )}

                    {isAdded
                      ? "Added"
                      : "Add to bag"}
                  </button>

                  {/* Remove */}

                  <button
                    type="button"
                    onClick={() =>
                      removeFromWishlist(product._id)
                    }
                    className="
                      mt-1
                      w-full
                      h-8
                      rounded-full
                      text-xs
                      font-semibold
                      text-gray-500
                      hover:text-red-600
                      transition-colors
                      flex
                      items-center
                      justify-center
                      gap-1
                    "
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>

                </div>

              </article>
            );
          })}

        </div>

      </div>

    </div>
  );
}

export default Wishlist;