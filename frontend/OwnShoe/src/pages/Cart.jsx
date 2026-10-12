import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(
        localStorage.getItem("ownshoe-cart") || "[]"
      );

      setCart(savedCart);
    };

    loadCart();

    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  const goBack = () => {
    window.history.back();
  };

  const updateQuantity = (id, selectedSize, change) => {
    const updatedCart = cart.map((item) => {
      if (item._id === id && item.selectedSize === selectedSize) {
        return {
          ...item,
          quantity: Math.max(1, item.quantity + change),
        };
      }

      return item;
    });

    setCart(updatedCart);

    localStorage.setItem("ownshoe-cart", JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeFromCart = (id, selectedSize) => {
    const updatedCart = cart.filter(
      (item) => !(item._id === id && item.selectedSize === selectedSize)
    );

    setCart(updatedCart);

    localStorage.setItem("ownshoe-cart", JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = cart.reduce((total, item) => {
    const price =
      Number(item.price || 0) > 0
        ? Number(item.price)
        : Number(item.discountPrice || 0) || Number(item.originalPrice || 0);

    return total + price * Number(item.quantity || 1);
  }, 0);

  const shipping = subtotal >= 2000 || subtotal === 0 ? 0 : 99;

  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f7f5]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
              OwnShoe / Cart
            </span>
          </div>

          <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-white/70 border border-black/5 backdrop-blur-xl shadow-sm flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-gray-700" />
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900">
              Your cart is empty
            </h1>

            <p className="mt-2 text-sm text-gray-500 max-w-md">
              Looks like you haven't added anything to your cart yet. Explore
              our latest shoes and find your perfect pair.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 px-6 h-11 rounded-full bg-black !text-white text-sm font-semibold hover:bg-red-600 hover:!text-white transition-colors"
            >
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            OwnShoe / Cart
          </span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 border border-black/5 backdrop-blur-xl shadow-sm">
              <ShoppingBag size={22} className="text-gray-900" />
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
                Your Cart
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {cart.reduce(
                  (total, item) => total + Number(item.quantity || 1),
                  0
                )}{" "}
                item(s) in your cart
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="flex flex-col gap-4">
            {cart.map((item) => {
              const image =
                item.images && item.images.length > 0
                  ? item.images[0]
                  : "https://via.placeholder.com/300x375?text=OwnShoe";

              const currentPrice =
                Number(item.price || 0) > 0
                  ? Number(item.price)
                  : Number(item.discountPrice || 0) ||
                    Number(item.originalPrice || 0);

              const originalPrice = Number(
                item.originalPrice || item.price || 0
              );

              const hasDiscount =
                originalPrice > currentPrice && currentPrice > 0;

              const discountPercentage = hasDiscount
                ? Math.round(
                    ((originalPrice - currentPrice) / originalPrice) * 100
                  )
                : 0;

              return (
                <div
                  key={`${item._id}-${item.selectedSize}`}
                  className="flex gap-4 p-4 rounded-2xl border border-black/5 bg-white/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  <Link to={`/product/${item._id}`} className="shrink-0">
                    <img
                      src={image}
                      alt={item.name}
                      className="w-28 h-32 sm:w-36 sm:h-40 object-cover rounded-xl bg-gray-100"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                          {item.brand}
                        </p>

                        <Link to={`/product/${item._id}`}>
                          <h2 className="mt-1 text-base sm:text-lg font-bold text-gray-900 truncate hover:text-red-600 transition-colors">
                            {item.name}
                          </h2>
                        </Link>

                        <p className="text-sm text-gray-500 mt-1">
                          {item.category}
                        </p>

                        {item.selectedSize && (
                          <p className="text-sm text-gray-600 mt-1">
                            Size:{" "}
                            <span className="font-semibold">
                              {item.selectedSize}
                            </span>
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item._id, item.selectedSize)
                        }
                        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Remove product"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <div className="mt-auto pt-4 flex items-end justify-between gap-3">
                      <div className="flex items-center border border-gray-200 bg-white/70 rounded-full h-9">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item._id, item.selectedSize, -1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-black disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item._id, item.selectedSize, 1)
                          }
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-black"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-base sm:text-lg font-extrabold text-gray-900">
                          ₹
                          {(
                            currentPrice * Number(item.quantity || 1)
                          ).toLocaleString("en-IN")}
                        </p>

                        {hasDiscount && (
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-xs text-gray-400 line-through">
                              ₹
                              {(
                                originalPrice * Number(item.quantity || 1)
                              ).toLocaleString("en-IN")}
                            </span>

                            <span className="text-[10px] font-bold text-red-600">
                              {discountPercentage}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur-xl shadow-sm p-5 sm:p-6">
              <h2 className="text-xl font-extrabold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>

                  <span className="font-semibold text-gray-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>

                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                <div className="h-px bg-black/10" />

                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-xl font-extrabold text-gray-900">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {subtotal < 2000 && (
                <p className="mt-5 text-xs text-gray-500 bg-white/70 rounded-xl p-3 border border-black/5">
                  Add ₹{(2000 - subtotal).toLocaleString("en-IN")} more to get
                  free express shipping.
                </p>
              )}

              <Link
                to="/checkout"
                className="mt-5 w-full h-12 rounded-full bg-black !text-white text-sm font-bold hover:bg-red-600 hover:!text-white transition-colors flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>

              <p className="text-[11px] text-center text-gray-400 mt-3">
                Secure checkout • 100% Authentic Footwear
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;