import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      <div className="container">

        <div className="footer-grid">

          {/* BRAND */}
          <div className="footer-brand">

            <Link
              to="/"
              className="logo footer-logo"
            >
              <span className="logo-mark">
                O
              </span>

              <span>
                OwnShoe
              </span>
            </Link>

            <h3>
              Your Shoe. Your Style.
            </h3>

            <p>
              High-performance silhouettes meet thoughtful
              design. Footwear built for people who move
              differently.
            </p>

            <div className="payment-title">
              VERIFIED & SECURE PAYMENTS
            </div>

            <div className="payment-icons">
              <span>UPI</span>
              <span>VISA</span>
              <span>MC</span>
              <span>✓</span>
            </div>

          </div>

          {/* SHOP */}
          <div className="footer-column">

            <h4>
              SHOP
            </h4>

            <Link to="/shop?category=Sneakers">
              Sneakers
            </Link>

            <Link to="/shop?category=Running">
              Running
            </Link>

            <Link to="/shop?category=Training">
              Training
            </Link>

            <Link to="/shop?category=Casual">
              Casual
            </Link>

            <Link to="/shop?category=Formal">
              Formal
            </Link>

            <Link to="/shop?filter=exclusive">
              Exclusive Drops
            </Link>

          </div>

          {/* CUSTOMER CARE */}
          <div className="footer-column">

            <h4>
              CUSTOMER CARE
            </h4>

            <Link to="/track-order">
              Track Order
            </Link>

            <Link to="/shipping">
              Shipping & Delivery
            </Link>

            <Link to="/returns">
              Returns & Exchanges
            </Link>

            <Link to="/size-guide">
              Size Guide
            </Link>

            <Link to="/faq">
              FAQs
            </Link>

            <Link to="/contact">
              Contact Us
            </Link>

          </div>

          {/* COMPANY */}
          <div className="footer-column">

            <h4>
              COMPANY
            </h4>

            <Link to="/about">
              About OwnShoe
            </Link>

            <Link to="/sustainability">
              Sustainability
            </Link>

            <Link to="/careers">
              Careers
            </Link>

            <Link to="/press">
              Press
            </Link>

            <Link to="/stores">
              Store Locator
            </Link>

          </div>

          {/* FOOTER NEWSLETTER */}
          <div className="footer-column footer-newsletter">

            <h4>
              STAY IN STEP
            </h4>

            <p>
              Be first in queue for limited silhouette runs
              and bespoke drops.
            </p>

            <form>

              <input
                type="email"
                placeholder="Enter your email"
              />

              <button>
                Subscribe
              </button>

            </form>

            <span className="follow-title">
              FOLLOW THE ATELIER
            </span>

            <div className="socials">

              <a
                href="#"
                aria-label="Instagram"
              >
                IG
              </a>

              <a
                href="#"
                aria-label="Facebook"
              >
                FB
              </a>

              <a
                href="#"
                aria-label="Twitter"
              >
                X
              </a>

            </div>

          </div>

        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">

          <span>
            © 2025 OwnShoe Inc. All rights reserved.
          </span>

          <div>

            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/terms">
              Terms of Service
            </Link>

            <Link to="/security">
              Security
            </Link>

            <Link to="/cookies">
              Cookie Settings
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;