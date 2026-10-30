import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
 
} from "lucide-react";

function Footer() {
  const categories = [
    "Sneakers",
    "Running",
    "Sports",
    "Casual",
    "Formal",
    "Boots",
    "Loafers",
    "Sandals",
    "Slides",
    "High-Tops",
    "Slip-Ons",
    "Trainers",
  ];

  const accountLinks = [
    { name: "My Profile", path: "/profile" },
    { name: "My Orders", path: "/orders" },
    { name: "My Wishlist", path: "/wishlist" },
    { name: "Shopping Cart", path: "/cart" },
    { name: "Login", path: "/login" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="own-footer">
      {/* TOP SHIPPING STRIP */}
      <div className="footer-top-strip">
        <div className="footer-container footer-top-inner">
          <span>
            <Truck size={15} />
            Free Express Shipping on Orders Above ₹2,000
          </span>

          <span className="footer-top-right">
            <ShieldCheck size={15} />
            Secure Shopping Experience
          </span>
        </div>
      </div>

      <div className="footer-container">
        {/* MAIN FOOTER */}
        <div className="footer-main-grid">
          {/* BRAND */}
          <div className="footer-brand-section">
            <Link to="/" className="footer-brand-logo">
              <span className="footer-logo-mark">O</span>

              <span>
                Own<span>Shoe</span>
              </span>
            </Link>

            <h2>
              YOUR SHOE.
              <br />
              <span>YOUR STYLE.</span>
            </h2>

            <p>
              Discover footwear that matches your personality. From everyday
              essentials to statement sneakers, find your perfect pair at
              OwnShoe.
            </p>

            <Link to="/shop" className="footer-explore-link">
              Explore Collection
              <ArrowUpRight size={17} />
            </Link>

            {/* PAYMENT INFORMATION */}
            <div className="footer-payment-section">
              <p>SECURE PAYMENT OPTIONS</p>

              <div className="footer-payment-list">
                <span>UPI</span>
                <span>VISA</span>
                <span>MC</span>
                <span>COD</span>
              </div>

              <div className="footer-payment-note">
                <ShieldCheck size={14} />
                Secure payments through Razorpay
              </div>
            </div>
          </div>

          {/* SHOP */}
          <div className="footer-link-column">
            <h3>SHOP</h3>

            <Link to="/shop">All Products</Link>

            {categories.map((category) => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
              >
                {category}
              </Link>
            ))}
          </div>

          {/* ACCOUNT */}
          <div className="footer-link-column">
            <h3>MY ACCOUNT</h3>

            {accountLinks.map((item) => (
              <Link key={item.path} to={item.path}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* INFORMATION */}
          <div className="footer-link-column">
            <h3>INFORMATION</h3>

            <Link to="/about">About OwnShoe</Link>

            <Link to="/shop">Our Collection</Link>

            <Link to="/orders">Order Information</Link>

            <Link to="/profile">Account Details</Link>
          </div>

          {/* CUSTOMER SUPPORT */}
          <div className="footer-support-column">
            <h3>HERE TO HELP</h3>

            <p>
              Need help with your shopping experience? Manage your account and
              orders directly.
            </p>

            <Link to="/orders" className="footer-support-card">
              <span className="footer-support-icon">
                <Truck size={19} />
              </span>

              <span>
                <strong>My Orders</strong>
                <small>View your order details</small>
              </span>

              <ArrowUpRight size={17} />
            </Link>

            <Link to="/profile" className="footer-support-card">
              <span className="footer-support-icon">
                <Headphones size={19} />
              </span>

              <span>
                <strong>My Account</strong>
                <small>Manage your profile</small>
              </span>

              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>

        {/* FOOTER HIGHLIGHTS */}
        <div className="footer-benefits">
          <div>
            <Truck size={21} />
            <span>
              <strong>Free Express Shipping</strong>
              <small>On orders above ₹2,000</small>
            </span>
          </div>

          <div>
            <ShieldCheck size={21} />
            <span>
              <strong>Secure Checkout</strong>
              <small>Protected online payments</small>
            </span>
          </div>

          <div>
            <RefreshCw size={21} />
            <span>
              <strong>Easy Order Access</strong>
              <small>Track your orders from your account</small>
            </span>
          </div>
        </div>

        {/* BOTTOM FOOTER */}
        <div className="footer-bottom">
          <p>© {currentYear} OwnShoe. All rights reserved.</p>

          <Link to="/" className="footer-back-top">
            BACK TO HOME
            <ArrowUpRight size={14} />
          </Link>

          <p className="footer-made">OWN YOUR STYLE.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
