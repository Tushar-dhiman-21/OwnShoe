import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Grid2x2,
  Rows3,
  Flame,
  Check,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import BackToHome from "../components/BackToHome";
import Footer from "../components/Footer";

// =====================================================
// CATEGORIES
// =====================================================

const CATEGORIES = [
  { id: "all", label: "All shoes" },
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
  {
    id: "sale",
    label: "On sale",
    icon: Flame,
  },
];

// =====================================================
// PRICE RANGES
// =====================================================

const PRICE_RANGES = [
  {
    id: "all",
    label: "All prices",
    min: 0,
    max: Infinity,
  },
  {
    id: "under-1500",
    label: "Under ₹1,500",
    min: 0,
    max: 1500,
  },
  {
    id: "1500-3000",
    label: "₹1,500 - ₹3,000",
    min: 1500,
    max: 3000,
  },
  {
    id: "3000-5000",
    label: "₹3,000 - ₹5,000",
    min: 3000,
    max: 5000,
  },
  {
    id: "above-5000",
    label: "Above ₹5,000",
    min: 5000,
    max: Infinity,
  },
];

export default function Shop() {
  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);

  // =====================================================
  // BASIC FILTERS
  // =====================================================

  const [search, setSearch] = useState("");

  const [activeCategory, setActiveCategory] = useState("all");

  const [sortBy, setSortBy] = useState("featured");

  // =====================================================
  // VIEW
  // =====================================================

  const [gridView, setGridView] = useState(true);

  // =====================================================
  // STATES
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // FILTER PANEL
  // =====================================================

  const [filterOpen, setFilterOpen] = useState(false);

  const [priceRange, setPriceRange] = useState("all");

  const [minRating, setMinRating] = useState(0);

  const [newOnly, setNewOnly] = useState(false);

  const [bestSellerOnly, setBestSellerOnly] = useState(false);

  // =====================================================
  // READ URL PARAMETERS
  // =====================================================

  const readURLParams = () => {
    const params = new URLSearchParams(window.location.search);

    const searchParam = params.get("search") || "";

    const categoryParam = params.get("category") || "all";

    const filterParam = params.get("filter") || "";

    // SEARCH
    setSearch(searchParam);

    // CATEGORY
    const validCategory = CATEGORIES.some(
      (category) => category.id === categoryParam,
    );

    if (validCategory) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory("all");
    }

    // HEADER FILTER
    if (filterParam === "new") {
      setSortBy("new");

      setNewOnly(true);
      setBestSellerOnly(false);
    } else if (filterParam === "best") {
      setSortBy("best");

      setBestSellerOnly(true);
      setNewOnly(false);
    } else {
      setSortBy("featured");

      setNewOnly(false);
      setBestSellerOnly(false);
    }
  };

  // =====================================================
  // INITIAL URL READ
  // =====================================================

  useEffect(() => {
    readURLParams();
  }, []);

  // =====================================================
  // BROWSER BACK / FORWARD
  // =====================================================

  useEffect(() => {
    const handlePopState = () => {
      readURLParams();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get("http://localhost:8000/api/products");

        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);

        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =====================================================
  // UPDATE URL
  // =====================================================

  const updateURL = ({
    searchValue = search,
    categoryValue = activeCategory,
    filterValue = "",
  }) => {
    const params = new URLSearchParams();

    // SEARCH
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    }

    // CATEGORY
    if (categoryValue && categoryValue !== "all") {
      params.set("category", categoryValue);
    }

    // HEADER FILTER
    if (filterValue === "new" || filterValue === "best") {
      params.set("filter", filterValue);
    }

    const queryString = params.toString();

    const newURL = queryString ? `/shop?${queryString}` : "/shop";

    const currentURL = window.location.pathname + window.location.search;

    if (currentURL !== newURL) {
      window.history.pushState({}, "", newURL);

      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (value) => {
    setSearch(value);

    updateURL({
      searchValue: value,
      categoryValue: activeCategory,
      filterValue: sortBy === "new" || sortBy === "best" ? sortBy : "",
    });
  };

  // =====================================================
  // CATEGORY
  // =====================================================

  const handleCategory = (categoryId) => {
    setActiveCategory(categoryId);

    updateURL({
      searchValue: search,
      categoryValue: categoryId,
      filterValue: sortBy === "new" || sortBy === "best" ? sortBy : "",
    });
  };

  // =====================================================
  // SORT
  // =====================================================

  const handleSort = (value) => {
    setSortBy(value);

    setNewOnly(false);
    setBestSellerOnly(false);

    updateURL({
      searchValue: search,
      categoryValue: activeCategory,
      filterValue: "",
    });
  };

  // =====================================================
  // FILTER COUNT
  // =====================================================

  const activeFilterCount =
    (priceRange !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (newOnly ? 1 : 0) +
    (bestSellerOnly ? 1 : 0);

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setPriceRange("all");

    setMinRating(0);

    setNewOnly(false);

    setBestSellerOnly(false);

    setSortBy("featured");

    updateURL({
      searchValue: search,
      categoryValue: activeCategory,
      filterValue: "",
    });
  };

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // ===================================================
    // SEARCH
    // ===================================================

    if (search.trim()) {
      const q = search.toLowerCase().trim();

      list = list.filter((product) => {
        return (
          product.name?.toLowerCase().includes(q) ||
          product.brand?.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q)
        );
      });
    }

    // ===================================================
    // CATEGORY
    // ===================================================

    if (activeCategory !== "all") {
      // ON SALE
      if (activeCategory === "sale") {
        list = list.filter((product) => {
          const price = Number(product.price || 0);

          const discountPrice = Number(product.discountPrice || 0);

          return discountPrice > 0 && discountPrice < price;
        });
      } else {
        // NORMAL CATEGORY
        list = list.filter(
          (product) =>
            product.category?.toLowerCase().trim() ===
            activeCategory.toLowerCase().trim(),
        );
      }
    }

    // ===================================================
    // NEW ARRIVALS
    // ===================================================

    if (sortBy === "new" || newOnly) {
      list = list.filter((product) => product.isNew === true);
    }

    // ===================================================
    // BEST SELLERS
    // =====================================================

    if (sortBy === "best" || bestSellerOnly) {
      list = list.filter((product) => product.isBestSeller === true);
    }

    // ===================================================
    // PRICE FILTER
    // ===================================================

    if (priceRange !== "all") {
      const selectedRange = PRICE_RANGES.find(
        (range) => range.id === priceRange,
      );

      if (selectedRange) {
        list = list.filter((product) => {
          const price = Number(product.discountPrice || product.price || 0);

          return price >= selectedRange.min && price <= selectedRange.max;
        });
      }
    }

    // ===================================================
    // RATING FILTER
    // ===================================================

    if (minRating > 0) {
      list = list.filter((product) => Number(product.rating || 0) >= minRating);
    }

    // ===================================================
    // PRICE LOW TO HIGH
    // ===================================================

    if (sortBy === "price-asc") {
      list.sort(
        (a, b) =>
          Number(a.discountPrice || a.price || 0) -
          Number(b.discountPrice || b.price || 0),
      );
    }

    // ===================================================
    // PRICE HIGH TO LOW
    // ===================================================

    if (sortBy === "price-desc") {
      list.sort(
        (a, b) =>
          Number(b.discountPrice || b.price || 0) -
          Number(a.discountPrice || a.price || 0),
      );
    }

    // ===================================================
    // TOP RATED
    // ===================================================

    if (sortBy === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    // ===================================================
    // BEST SELLERS
    // ===================================================

    if (sortBy === "best") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    // ===================================================
    // NEW ARRIVALS
    // ===================================================

    if (sortBy === "new") {
      list.sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    }

    return list;
  }, [
    products,
    search,
    activeCategory,
    sortBy,
    priceRange,
    minRating,
    newOnly,
    bestSellerOnly,
  ]);

  // =====================================================
  // CURRENT HEADING
  // =====================================================

  const getHeading = () => {
    if (sortBy === "new" || newOnly) {
      return "New arrivals";
    }

    if (sortBy === "best" || bestSellerOnly) {
      return "Best sellers";
    }

    if (activeCategory !== "all") {
      const category = CATEGORIES.find((item) => item.id === activeCategory);

      return category?.label || "Shop all shoes";
    }

    return "Shop all shoes";
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f7f5]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 lg:pt-8 pb-16">
        {/* ================================================= */}
        {/* TOP NAV */}
        {/* ================================================= */}

        <div className="mb-8 flex items-center justify-between">
          <BackToHome />

          <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            OwnShoe / Shop
          </span>
        </div>

        {/* ================================================= */}
        {/* HEADING */}
        {/* ================================================= */}

        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />

            <span className="text-[11px] font-bold text-red-600 tracking-widest uppercase">
              Curated drop
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl tracking-tight text-gray-900 font-extrabold">
            {getHeading()}
          </h1>

          <p className="text-sm text-gray-500">
            Showing {filteredProducts.length} premium footwear pieces
          </p>
        </div>

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <div className="relative mb-4 max-w-2xl">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search silhouette, brand, or style..."
            className="
              w-full
              h-12
              pl-11
              pr-10
              rounded-full
              border border-black/10
              bg-white/70
              backdrop-blur-xl
              text-sm
              text-gray-900
              outline-none
              shadow-sm
              transition-all
              focus:border-black/20
              focus:ring-2
              focus:ring-black/10
              placeholder:text-gray-400
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="
                absolute
                right-3.5
                top-1/2
                -translate-y-1/2
                w-6
                h-6
                rounded-full
                bg-gray-100
                flex
                items-center
                justify-center
                text-gray-500
                hover:bg-black
                hover:text-white
                transition-colors
              "
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ================================================= */}
        {/* CATEGORIES */}
        {/* ================================================= */}

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;

            const active = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategory(cat.id)}
                className={`
                  shrink-0
                  px-4
                  py-2.5
                  rounded-full
                  text-sm
                  font-semibold
                  flex
                  items-center
                  gap-1.5
                  transition-all
                  duration-300
                  ${
                    active
                      ? "bg-black !text-white shadow-md"
                      : "bg-white/70 border border-black/10 text-gray-700 backdrop-blur-xl hover:bg-black hover:!text-white"
                  }
                `}
              >
                {Icon && <Icon size={15} />}

                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ================================================= */}
        {/* FILTER + SORT + VIEW */}
        {/* ================================================= */}

        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          {/* FILTER */}

          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="
              h-10
              px-4
              rounded-full
              bg-white/70
              border border-black/10
              backdrop-blur-xl
              hover:bg-black
              hover:!text-white
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-gray-900
              transition-all
              duration-300
            "
          >
            <SlidersHorizontal size={16} />
            Filter
            {activeFilterCount > 0 && (
              <span
                className="
                  w-5
                  h-5
                  rounded-full
                  bg-red-600
                  !text-white
                  text-[10px]
                  flex
                  items-center
                  justify-center
                  font-bold
                "
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* SORT */}

            <div className="relative">
              <select
                value={
                  sortBy === "new" || sortBy === "best" ? "featured" : sortBy
                }
                onChange={(e) => handleSort(e.target.value)}
                className="
                  h-10
                  pl-4
                  pr-9
                  rounded-full
                  bg-white/70
                  border border-black/10
                  backdrop-blur-xl
                  hover:bg-white
                  text-sm
                  text-gray-900
                  appearance-none
                  outline-none
                  cursor-pointer
                  shadow-sm
                "
              >
                <option value="featured">Sort: Featured</option>

                <option value="price-asc">Price: Low to high</option>

                <option value="price-desc">Price: High to low</option>

                <option value="rating">Top rated</option>
              </select>

              <ChevronDown
                size={15}
                className="
                  pointer-events-none
                  absolute
                  right-3.5
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />
            </div>

            {/* GRID / LIST */}

            <div className="hidden sm:flex items-center bg-white/70 border border-black/10 backdrop-blur-xl p-1 rounded-full">
              <button
                type="button"
                onClick={() => setGridView(true)}
                className={`
                  w-8
                  h-8
                  rounded-full
                  flex
                  items-center
                  justify-center
                  transition-all
                  ${
                    gridView
                      ? "bg-black !text-white shadow-sm"
                      : "text-gray-400 hover:text-black"
                  }
                `}
              >
                <Grid2x2 size={16} />
              </button>

              <button
                type="button"
                onClick={() => setGridView(false)}
                className={`
                  w-8
                  h-8
                  rounded-full
                  flex
                  items-center
                  justify-center
                  transition-all
                  ${
                    !gridView
                      ? "bg-black !text-white shadow-sm"
                      : "text-gray-400 hover:text-black"
                  }
                `}
              >
                <Rows3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* FILTER PANEL */}
        {/* ================================================= */}

        {filterOpen && (
          <div
            className="
              mb-6
              bg-white
              border
              border-black/10
              rounded-2xl
              shadow-lg
              p-5
            "
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">Filter shoes</h3>

                <p className="text-xs text-gray-500 mt-1">
                  Refine your collection
                </p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="
                  text-xs
                  font-semibold
                  text-red-600
                  hover:text-black
                  transition
                "
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PRICE */}

              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">Price</p>

                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setPriceRange(range.id)}
                      className={`
                          w-full
                          flex
                          items-center
                          justify-between
                          px-3
                          py-2.5
                          rounded-xl
                          text-sm
                          transition
                          ${
                            priceRange === range.id
                              ? "bg-black text-white"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }
                        `}
                    >
                      <span>{range.label}</span>

                      {priceRange === range.id && <Check size={15} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* RATING */}

              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">
                  Minimum rating
                </p>

                <div className="space-y-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setMinRating(rating)}
                      className={`
                          w-full
                          flex
                          items-center
                          justify-between
                          px-3
                          py-2.5
                          rounded-xl
                          text-sm
                          transition
                          ${
                            minRating === rating
                              ? "bg-black text-white"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }
                        `}
                    >
                      <span>
                        {rating === 0 ? "All ratings" : `${rating}★ & above`}
                      </span>

                      {minRating === rating && <Check size={15} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLLECTION */}

              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">
                  Collection
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setNewOnly(!newOnly)}
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      px-3
                      py-2.5
                      rounded-xl
                      text-sm
                      transition
                      ${
                        newOnly
                          ? "bg-black text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <span>New arrivals</span>

                    {newOnly && <Check size={15} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setBestSellerOnly(!bestSellerOnly)}
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      px-3
                      py-2.5
                      rounded-xl
                      text-sm
                      transition
                      ${
                        bestSellerOnly
                          ? "bg-black text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <span>Best sellers</span>

                    {bestSellerOnly && <Check size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* APPLY */}

            <div className="flex justify-end mt-5 pt-5 border-t border-black/10">
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="
                  px-6
                  py-2.5
                  rounded-full
                  bg-black
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-red-600
                  transition
                "
              >
                Apply filters
              </button>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div className="glass rounded-2xl flex justify-center items-center py-20">
            <p className="text-gray-500 text-sm">Loading shoes...</p>
          </div>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {!loading && error && (
          <div className="glass rounded-2xl flex justify-center items-center py-20">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* ================================================= */}
        {/* PRODUCTS */}
        {/* ================================================= */}

        {!loading && !error && (
          <>
            <div
              className={
                gridView
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5"
                  : "grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5"
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* ================================================= */}
            {/* NO PRODUCTS */}
            {/* ================================================= */}

            {filteredProducts.length === 0 && (
              <div className="glass rounded-2xl text-center py-16 mt-4">
                <p className="text-gray-500 py-2">
                  No shoes match your current selection.
                </p>

                {(activeFilterCount > 0 ||
                  activeCategory !== "all" ||
                  search) && (
                  <button
                    type="button"
                    onClick={() => {
                      clearFilters();

                      setSearch("");

                      setActiveCategory("all");

                      updateURL({
                        searchValue: "",
                        categoryValue: "all",
                        filterValue: "",
                      });
                    }}
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-red-600
                      hover:text-black
                    "
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    <div><Footer></Footer></div>

    </div>
  );
}
