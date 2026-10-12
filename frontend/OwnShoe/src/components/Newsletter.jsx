import { ArrowRight } from "lucide-react";

function Newsletter() {
  return (
    <section className="newsletter-section">

      <div className="container newsletter-inner">

        <div>

          <span className="section-label">
            STAY IN STEP
          </span>

          <h2>
            Be first to know.
          </h2>

          <p>
            Get early access to limited drops, new releases
            and exclusive offers.
          </p>

        </div>

        <form className="newsletter-form">

          <input
            type="email"
            placeholder="Enter your email address"
          />

          <button type="submit">
            Subscribe
            <ArrowRight size={17} />
          </button>

        </form>

      </div>

    </section>
  );
}

export default Newsletter;