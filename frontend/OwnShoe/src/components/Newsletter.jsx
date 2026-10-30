import { useState } from "react";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("success");
    setMessage("Thanks for subscribing! Stay tuned for updates.");
    setEmail("");
  };

  return (
    <section className="newsletter-section">
      <div className="container newsletter-inner">
        <div>
          <span className="section-label">STAY IN STEP</span>

          <h2>Be first to know.</h2>

          <p>
            Get early access to limited drops, new releases and exclusive
            offers.
          </p>
        </div>

        <div className="newsletter-right">
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
                setStatus("");
              }}
            />

            <button type="submit">
              Subscribe
              <ArrowRight size={17} />
            </button>
          </form>

          {message && (
            <p
              className={`newsletter-message ${
                status === "success" ? "success" : "error"
              }`}
            >
              {status === "success" ? (
                <CheckCircle size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
