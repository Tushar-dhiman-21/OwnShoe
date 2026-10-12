import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";    
// import axios from "axios";
import { api } from "../api";

const categories = [
  {
    name: "Sneakers",
    image:
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
  },
  {
    name: "Running",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80",
  },
  {
    name: "Sports",
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
  },
  {
    name: "Casual",
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80",
  },
  {
    name: "Formal",
    image:
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80",
  },
  {
    name: "Boots",
    image:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80",
  },
];

function Categories() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/api/products");

        const productData = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];

        setProducts(productData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const getCategoryCount = (categoryName) => {
    return products.filter(
      (product) =>
        product.category?.toLowerCase() === categoryName.toLowerCase()
    ).length;
  };

  return (
    <section className="section categories-section bg-[#f7f7f5]">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="section-label">
              SHOP BY CATEGORY
            </span>

            <h2>Find your pair.</h2>
          </div>

          <Link
            to="/shop"
            className="glass glass-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold !text-gray-950 hover:bg-black hover:!text-black"
          >
            View all categories
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const count = getCategoryCount(category.name);

            return (
              <Link
                to={`/shop?category=${category.name}`}
                className="group relative overflow-hidden rounded-2xl bg-black shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                key={category.name}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 bg-red-600/0 transition-all duration-500 group-hover:bg-red-600/10" />

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 rounded-xl border border-white/20 bg-black/35 p-4 backdrop-blur-xl transition-all duration-300 group-hover:bg-black/50">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {category.name}
                    </h3>

                    {/* <span className="mt-1 block text-xs font-medium text-gray-300">
                      {count} {count === 1 ? "Product" : "Products"}
                    </span> */}
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover:translate-x-1 group-hover:bg-red-600 group-hover:text-white">
                    <ArrowRight size={17} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Categories;