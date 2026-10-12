import { useEffect, useState } from "react";
import {
  Heart,
  ShoppingBag,
  ChevronDown,
  UserRound,
  Package,
  LogOut,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const CATEGORIES = [
  { id: "sneakers", label: "Sneakers" },
  { id: "running", label: "Running" },
  { id: "sports", label: "Sports" },
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
  { id: "boots", label: "Boots" },
  { id: "loafers", label: "Loafers" },
  { id: "sandals", label: "Sandals" },
  { id: "slides", label: "Slides" },
  { id: "high-tops", label: "High Tops" },
  { id: "slip-ons", label: "Slip Ons" },
  { id: "trainers", label: "Trainers" },
];

function Header() {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Update cart and wishlist data
  const updateHeaderData = () => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("ownshoe-cart") || "[]",
      );

      const totalItems = savedCart.reduce((total, item) => {
        return total + Number(item.quantity || 0);
      }, 0);

      const totalPrice = savedCart.reduce((total, item) => {
        return total + Number(item.price || 0) * Number(item.quantity || 0);
      }, 0);

      setCartCount(totalItems);
      setCartSubtotal(totalPrice);

      const savedWishlist = JSON.parse(
        localStorage.getItem("ownshoe-wishlist") || "[]",
      );

      setWishlistCount(savedWishlist.length);
    } catch (error) {
      console.error("Failed to update header:", error);

      setCartCount(0);
      setCartSubtotal(0);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    updateHeaderData();

    window.addEventListener("cartUpdated", updateHeaderData);
    window.addEventListener("wishlistUpdated", updateHeaderData);
    window.addEventListener("storage", updateHeaderData);
    window.addEventListener("focus", updateHeaderData);

    return () => {
      window.removeEventListener("cartUpdated", updateHeaderData);
      window.removeEventListener("wishlistUpdated", updateHeaderData);
      window.removeEventListener("storage", updateHeaderData);
      window.removeEventListener("focus", updateHeaderData);
    };
  }, []);

  // Category navigation
  const handleCategory = (category) => {
    setCategoryOpen(false);
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  // New arrivals navigation
  const handleNewArrivals = () => {
    setCategoryOpen(false);
    navigate("/shop?filter=new");
  };

  // Best sellers navigation
  const handleBestSellers = () => {
    setCategoryOpen(false);
    navigate("/shop?filter=best");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("ownshoe-user");
    localStorage.removeItem("ownshoe-token");
    localStorage.removeItem("token");

    setProfileOpen(false);

    navigate("/login");
  };

  return (
    <>
      {/* Top announcement strip */}
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Free express shipping on all orders over ₹2,000</span>

          <span className="top-strip-middle">
            100% Authentic Footwear • Direct From Atelier
          </span>

          <span className="verified-delivery">✓ Guaranteed Delivery</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="container header-inner">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-mark">O</span>
            <span>OwnShoe</span>
          </Link>

          {/* Navigation */}
          <nav className="desktop-nav">
            <Link to="/" className="active">
              Home
            </Link>

            <Link to="/shop">Shop All</Link>

           {/* Categories Dropdown */}

<div
  className={`category-dropdown ${categoryOpen ? "is-open" : ""}`}
  onMouseEnter={() => setCategoryOpen(true)}
  onMouseLeave={() => setCategoryOpen(false)}
>
  <button
    type="button"
    className="nav-dropdown"
    onClick={() => setCategoryOpen((prev) => !prev)}
    aria-expanded={categoryOpen}
  >
    Categories
    <ChevronDown
      size={14}
      className={categoryOpen ? "chevron-rotated" : ""}
    />
  </button>

  <div className="category-menu">
    {CATEGORIES.map((category) => (
      <button
        key={category.id}
        type="button"
        className="category-menu-item"
        onClick={() => handleCategory(category.id)}
      >
        {category.label}
      </button>
    ))}

{/* <button
  type="button"
  className="category-menu-item category-sale"
  onClick={() => handleCategory("sale")}
>
  On Sale
</button> */}

  </div>
</div>


            {/* New Arrivals */}
            <button
              type="button"
              onClick={handleNewArrivals}
              className="nav-link"
            >
              New Arrivals
            </button>

            {/* Best Sellers */}
            <button
              type="button"
              onClick={handleBestSellers}
              className="nav-link"
            >
              Best Sellers
            </button>

            <Link to="/about">Brand Story</Link>
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="header-icon relative"
              aria-label="Wishlist"
            >
              <Heart size={21} strokeWidth={1.8} />

              {wishlistCount > 0 && (
                <span className="icon-badge">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="cart-box" aria-label="Shopping cart">
              <div className="cart-icon">
                <ShoppingBag size={20} />

                {cartCount > 0 && (
                  <span className="icon-badge">{cartCount}</span>
                )}
              </div>

              <div className="cart-text">
                <small>SUBTOTAL</small>

                <strong>₹{cartSubtotal.toLocaleString("en-IN")}</strong>
              </div>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="header-icon"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <UserRound size={21} strokeWidth={1.8} />
              </button>

              {profileOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-full
                    z-50
                    mt-3
                    w-52
                    overflow-hidden
                    rounded-2xl
                    border
                    border-black/10
                    bg-white
                    shadow-xl
                  "
                >
                  {/* My Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/profile");
                      setProfileOpen(false);
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      text-gray-700
                      transition
                      hover:bg-black
                      hover:text-white
                    "
                  >
                    <User size={17} />
                    My Profile
                  </button>

                  {/* My Orders */}
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/orders");
                      setProfileOpen(false);
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      text-gray-700
                      transition
                      hover:bg-black
                      hover:text-white
                    "
                  >
                    <Package size={17} />
                    My Orders
                  </button>

                  {/* Wishlist */}
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/wishlist");
                      setProfileOpen(false);
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      text-gray-700
                      transition
                      hover:bg-black
                      hover:text-white
                    "
                  >
                    <Heart size={17} />
                    Wishlist
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      text-red-600
                      transition
                      hover:bg-red-50
                    "
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
