
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";

import ProductCard from "./ProductCard";

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await api.get("/api/products");

        const allProducts = response.data.products || [];

        const newProducts = allProducts.filter(
          (product) => product.isNew === true
        );

        setProducts(newProducts.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <section className="section new-arrivals bg-[#f7f7f5]">
      <div className="container">
        {/* ================= HEADING ================= */}
        <div className="section-heading">
          <div>
            <span className="section-label">
              JUST DROPPED
            </span>

            <h2>New Arrivals</h2>
          </div>

          <Link
            to="/shop?filter=new"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-5 py-2.5 text-sm font-bold !text-black shadow-sm backdrop-blur-xl transition-all duration-300 hover:bg-black hover:!text-white hover:-translate-y-0.5 hover:shadow-lg"
          >
            Shop all
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* ================= PRODUCTS ================= */}
        {loading ? (
          <div className="glass rounded-2xl py-14 text-center">
            <p className="text-sm font-medium text-gray-500">
              Loading new arrivals...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass rounded-2xl py-14 text-center">
            <p className="text-sm font-medium text-gray-500">
              No new arrivals available.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                product={product}
                key={product._id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default NewArrivals;
