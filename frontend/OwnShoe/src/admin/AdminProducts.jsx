import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Package,
  Star,
  Tag,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const PRODUCTS_ENDPOINT = "/api/products";

const DEFAULT_SIZES = [6, 7, 8, 9, 10];

// =====================================================
// ALL OWNSHOE CATEGORIES
// =====================================================

const CATEGORIES = [
  { id: "sneakers", label: "Sneakers" },
  { id: "running", label: "Running" },
  { id: "casual", label: "Casual" },
  { id: "boots", label: "Boots" },
  { id: "loafers", label: "Loafers" },
  { id: "formal", label: "Formal" },
  { id: "sports", label: "Sports" },
  { id: "sandals", label: "Sandals" },
  { id: "slides", label: "Slides" },
  { id: "high-tops", label: "High Tops" },
  { id: "slip-ons", label: "Slip-Ons" },
  { id: "trainers", label: "Trainers" },
];

const initialForm = {
  name: "",
  brand: "",
  price: "",
  discountPrice: "",
  category: "sneakers",
  description: "",
  images: "",
  sizes: "",
  colors: "",
  stock: "",
  rating: "",
  isNew: false,
  isBestSeller: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(initialForm);

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(PRODUCTS_ENDPOINT);
      const payload = response.data;

      const productList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      setProducts(productList);
    } catch (err) {
      console.error("Failed to fetch products:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load products. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price ?? "",
      discountPrice: product.discountPrice ?? "",
      category: product.category || "sneakers",
      description: product.description || "",
      images: product.images?.join(", ") || "",

      sizes:
        product.sizes?.length > 0
          ? product.sizes.join(", ")
          : DEFAULT_SIZES.join(", "),

      colors: product.colors?.join(", ") || "",
      stock: product.stock ?? "",
      rating: product.rating ?? "0",
      isNew: Boolean(product.isNew),
      isBestSeller: Boolean(product.isBestSeller),
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProduct(null);
    setForm(initialForm);
  };

  // =====================================================
  // PREPARE PRODUCT DATA
  // =====================================================

  const prepareProductData = () => {
    const images = form.images
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const sizes = form.sizes.trim()
      ? [
          ...new Set(
            form.sizes.split(",").map((item) => {
              const value = item.trim();
              return value === "" ? Number.NaN : Number(value);
            }),
          ),
        ]
      : DEFAULT_SIZES;

    const colors = form.colors
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const price = Number(form.price);

    const discountPrice =
      form.discountPrice.trim() === "" ? null : Number(form.discountPrice);

    const stock = Number(form.stock);
    const rating = Number(form.rating);

    return {
      name: form.name.trim(),
      brand: form.brand.trim(),
      price,
      discountPrice,
      category: form.category,
      description: form.description.trim(),
      images,
      sizes,
      colors,
      stock,
      rating,
      isNew: form.isNew,
      isBestSeller: form.isBestSeller,
    };
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = (data) => {
    if (!data.name) {
      return "Product name is required.";
    }

    if (!data.brand) {
      return "Brand is required.";
    }

    if (!Number.isFinite(data.price) || data.price <= 0) {
      return "Please enter a valid price.";
    }

    if (
      data.discountPrice !== null &&
      (data.discountPrice <= 0 || data.discountPrice >= data.price)
    ) {
      return "Discount price must be greater than 0 and less than the original price.";
    }

    if (!data.description) {
      return "Product description is required.";
    }

    if (data.images.length === 0) {
      return "Please add at least one image URL.";
    }

    if (data.colors.length === 0) {
      return "Please add at least one color.";
    }

    if (
      form.stock.trim() === "" ||
      !Number.isInteger(data.stock) ||
      data.stock < 0
    ) {
      return "Please enter a valid whole-number stock quantity (0 or more).";
    }

    if (!Number.isFinite(data.rating) || data.rating < 0 || data.rating > 5) {
      return "Rating must be between 0 and 5.";
    }

    if (
      !Array.isArray(data.sizes) ||
      data.sizes.length === 0 ||
      data.sizes.some((size) => !Number.isFinite(size) || size <= 0)
    ) {
      return "Enter valid shoe sizes separated by commas, e.g. 6, 7, 8, 9, 10.";
    }

    return "";
  };

  // =====================================================
  // ADD / UPDATE PRODUCT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const productData = prepareProductData();

      const validationError = validateForm(productData);

      if (validationError) {
        setError(validationError);
        setSaving(false);
        return;
      }

      if (editingProduct) {
        const response = await api.put(
          `${PRODUCTS_ENDPOINT}/${editingProduct._id}`,
          productData,
        );

        const updatedProduct =
          response.data?.product || response.data?.data || response.data;

        if (!updatedProduct?._id) {
          await fetchProducts();
        } else {
          setProducts((prev) =>
            prev.map((product) =>
              product._id === editingProduct._id ? updatedProduct : product,
            ),
          );
        }

        setSuccess("Product updated successfully.");
      } else {
        const response = await api.post(PRODUCTS_ENDPOINT, productData);

        const newProduct =
          response.data?.product || response.data?.data || response.data;

        if (newProduct?._id) {
          setProducts((prev) => [
            newProduct,
            ...prev.filter((product) => product._id !== newProduct._id),
          ]);
        } else {
          await fetchProducts();
        }

        setSuccess("Product added successfully.");
      }

      setShowModal(false);
      setEditingProduct(null);
      setForm(initialForm);
    } catch (err) {
      console.error("Product save error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save product.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) return;

    if (deletingId) return;

    try {
      setDeletingId(product._id);
      setError("");
      setSuccess("");

      await api.delete(`${PRODUCTS_ENDPOINT}/${product._id}`);

      setProducts((prev) => prev.filter((item) => item._id !== product._id));

      setSuccess("Product deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete product.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return products;

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  // =====================================================
  // DISCOUNT %
  // =====================================================

  const getDiscountPercentage = (product) => {
    if (!product.discountPrice || product.discountPrice >= product.price) {
      return 0;
    }

    return Math.round(
      ((product.price - product.discountPrice) / product.price) * 100,
    );
  };

  // =====================================================
  // FORMAT CATEGORY
  // =====================================================

  const formatCategory = (category) => {
    if (!category) return "";

    const found = CATEGORIES.find((item) => item.id === category);

    if (found) return found.label;

    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="border-b border-black/10 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/admin"
                className="
                  w-10
                  h-10
                  rounded-full
                  border
                  border-black/10
                  bg-white
                  text-black
                  flex
                  items-center
                  justify-center
                  hover:bg-black
                  hover:!text-white
                  transition-all
                "
              >
                <ChevronLeft size={18} />
              </Link>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-600">
                  OwnShoe Admin
                </p>

                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
                  Products
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="
                h-11
                px-4
                sm:px-5
                rounded-full
                bg-black
                text-white
                flex
                items-center
                gap-2
                text-sm
                font-bold
                hover:bg-red-600
                transition-all
              "
            >
              <Plus size={18} />

              <span className="hidden sm:inline">Add Product</span>

              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
        {/* ================================================= */}
        {/* TOP INFO */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* TOTAL */}

          <div className="bg-white rounded-2xl border border-black/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Total Products
                </p>

                <p className="text-2xl font-extrabold mt-1">
                  {products.length}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Package size={19} />
              </div>
            </div>
          </div>

          {/* NEW */}

          <div className="bg-white rounded-2xl border border-black/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  New Arrivals
                </p>

                <p className="text-2xl font-extrabold mt-1">
                  {products.filter((product) => product.isNew).length}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Tag size={19} />
              </div>
            </div>
          </div>

          {/* BEST */}

          <div className="bg-white rounded-2xl border border-black/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Best Sellers
                </p>

                <p className="text-2xl font-extrabold mt-1">
                  {products.filter((product) => product.isBestSeller).length}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Star size={19} />
              </div>
            </div>
          </div>

          {/* SALE */}

          <div className="bg-white rounded-2xl border border-black/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">On Sale</p>

                <p className="text-2xl font-extrabold mt-1">
                  {
                    products.filter(
                      (product) =>
                        product.discountPrice &&
                        product.discountPrice < product.price,
                    ).length
                  }
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Tag size={19} />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* SEARCH + REFRESH */}
        {/* ================================================= */}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="
                w-full
                h-12
                pl-11
                pr-11
                rounded-full
                bg-white
                border
                border-black/10
                text-sm
                text-gray-900
                outline-none
                focus:border-black/30
                focus:ring-2
                focus:ring-black/5
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-black
                "
              >
                <X size={17} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="
              h-12
              px-5
              rounded-full
              bg-white
              border
              border-black/10
              flex
              items-center
              justify-center
              gap-2
              text-sm
              font-semibold
              text-black
              hover:bg-black
              hover:text-white
              transition-all
              disabled:opacity-50
            "
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ================================================= */}
        {/* SUCCESS */}
        {/* ================================================= */}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && !showModal && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div className="bg-white rounded-2xl border border-black/5 py-20 flex flex-col items-center justify-center">
            <RefreshCw size={25} className="animate-spin text-gray-400 mb-3" />

            <p className="text-sm text-gray-500">Loading products...</p>
          </div>
        )}

        {/* ================================================= */}
        {/* PRODUCTS */}
        {/* ================================================= */}

        {!loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Product Catalog
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/5 py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 mx-auto flex items-center justify-center mb-4">
                  <Package size={25} className="text-gray-400" />
                </div>

                <h3 className="font-bold text-gray-900">No products found</h3>

                <p className="text-sm text-gray-500 mt-1">
                  {search
                    ? "Try a different search."
                    : "Add your first product to get started."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="
                      mt-5
                      px-5
                      h-10
                      rounded-full
                      bg-black
                      text-white
                      text-sm
                      font-bold
                      hover:bg-red-600
                      transition
                    "
                  >
                    Add Product
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
                {/* ================================================= */}
                {/* DESKTOP TABLE */}
                {/* ================================================= */}

                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/10 bg-gray-50/70">
                        <th className="text-left px-5 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                          Product
                        </th>

                        <th className="text-left px-5 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                          Category
                        </th>

                        <th className="text-left px-5 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                          Price
                        </th>

                        <th className="text-left px-5 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                          Stock
                        </th>

                        <th className="text-left px-5 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                          Status
                        </th>

                        <th className="text-right px-5 py-4 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredProducts.map((product) => {
                        const discount = getDiscountPercentage(product);

                        return (
                          <tr
                            key={product._id}
                            className="border-b border-black/5 last:border-0 hover:bg-gray-50/60 transition"
                          >
                            {/* PRODUCT */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                  {product.images?.[0] ? (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon
                                        size={20}
                                        className="text-gray-400"
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-gray-900 truncate max-w-[230px]">
                                    {product.name}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {product.brand}
                                  </p>

                                  <div className="flex items-center gap-2 mt-1">
                                    {product.isNew && (
                                      <span className="text-[9px] uppercase tracking-wider font-bold text-red-600">
                                        New
                                      </span>
                                    )}

                                    {product.isBestSeller && (
                                      <span className="text-[9px] uppercase tracking-wider font-bold text-yellow-600">
                                        Best Seller
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* CATEGORY */}

                            <td className="px-5 py-4">
                              <span className="inline-flex px-3 py-1.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                                {formatCategory(product.category)}
                              </span>
                            </td>

                            {/* PRICE */}

                            <td className="px-5 py-4">
                              {product.discountPrice &&
                              product.discountPrice < product.price ? (
                                <div>
                                  <p className="font-bold text-sm text-red-600">
                                    ₹
                                    {Number(
                                      product.discountPrice,
                                    ).toLocaleString("en-IN")}
                                  </p>

                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-gray-400 line-through">
                                      ₹
                                      {Number(product.price).toLocaleString(
                                        "en-IN",
                                      )}
                                    </span>

                                    <span className="text-[9px] font-bold text-green-600">
                                      {discount}% OFF
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <p className="font-bold text-sm">
                                  ₹
                                  {Number(product.price).toLocaleString(
                                    "en-IN",
                                  )}
                                </p>
                              )}
                            </td>

                            {/* STOCK */}

                            <td className="px-5 py-4">
                              <span
                                className={`text-sm font-bold ${
                                  Number(product.stock) <= 5
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {product.stock}
                              </span>

                              <span className="text-xs text-gray-400 ml-1">
                                units
                              </span>
                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">
                              {Number(product.stock) === 0 ? (
                                <span className="inline-flex px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                                  Out of stock
                                </span>
                              ) : Number(product.stock) <= 5 ? (
                                <span className="inline-flex px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold">
                                  Low stock
                                </span>
                              ) : (
                                <span className="inline-flex px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">
                                  In stock
                                </span>
                              )}
                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(product)}
                                  className="
                                      w-9
                                      h-9
                                      rounded-full
                                      border
                                      border-black/10
                                      flex
                                      items-center
                                      justify-center
                                      text-gray-600
                                      hover:bg-black
                                      hover:text-white
                                      transition
                                    "
                                >
                                  <Pencil size={15} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(product)}
                                  disabled={deletingId === product._id}
                                  className="
                                      w-9
                                      h-9
                                      rounded-full
                                      border
                                      border-red-100
                                      flex
                                      items-center
                                      justify-center
                                      text-red-500
                                      hover:bg-red-600
                                      hover:text-white
                                      transition
                                    "
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ================================================= */}
                {/* MOBILE / TABLET */}
                {/* ================================================= */}

                <div className="lg:hidden divide-y divide-black/5">
                  {filteredProducts.map((product) => {
                    const discount = getDiscountPercentage(product);

                    return (
                      <div key={product._id} className="p-4">
                        <div className="flex gap-3">
                          <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon
                                  size={20}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-sm text-gray-900">
                                  {product.name}
                                </h3>

                                <p className="text-xs text-gray-500 mt-1">
                                  {product.brand}
                                </p>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(product)}
                                  className="
                                      w-8
                                      h-8
                                      rounded-full
                                      border
                                      border-black/10
                                      text-black
                                      flex
                                      items-center
                                      justify-center
                                      hover:bg-black
                                      hover:text-white
                                    "
                                >
                                  <Pencil size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(product)}
                                  disabled={deletingId === product._id}
                                  className="
                                      w-8
                                      h-8
                                      rounded-full
                                      border
                                      border-red-100
                                      text-red-500
                                      flex
                                      items-center
                                      justify-center
                                      hover:bg-red-600
                                      hover:text-white
                                    "
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-[10px] font-semibold">
                                {formatCategory(product.category)}
                              </span>

                              {product.isNew && (
                                <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                                  New
                                </span>
                              )}

                              {product.isBestSeller && (
                                <span className="px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 text-[10px] font-bold">
                                  Best Seller
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            {product.discountPrice &&
                            product.discountPrice < product.price ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-red-600">
                                  ₹
                                  {Number(product.discountPrice).toLocaleString(
                                    "en-IN",
                                  )}
                                </span>

                                <span className="text-xs text-gray-400 line-through">
                                  ₹
                                  {Number(product.price).toLocaleString(
                                    "en-IN",
                                  )}
                                </span>

                                <span className="text-[10px] font-bold text-green-600">
                                  {discount}% OFF
                                </span>
                              </div>
                            ) : (
                              <span className="font-extrabold">
                                ₹{Number(product.price).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          <div
                            className={`text-xs font-bold ${
                              Number(product.stock) <= 5
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            Stock: {product.stock}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ================================================= */}
      {/* ADD / EDIT MODAL */}
      {/* ================================================= */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/50
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-3
            sm:p-5
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-4xl
              max-h-[94vh]
              overflow-y-auto
              bg-white
              rounded-2xl
              shadow-2xl
            "
          >
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 bg-white border-b border-black/10 px-5 sm:px-7 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-red-600">
                  OwnShoe Catalog
                </p>

                <h2 className="text-xl font-extrabold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-gray-100
                  text-black
                  flex
                  items-center
                  justify-center
                  hover:bg-black
                  hover:text-white
                  transition
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="p-5 sm:p-7">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NAME */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Air Max Runner"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-black/10
                      bg-gray-50
                      text-sm
                      text-black
                      outline-none
                      focus:bg-white
                      focus:border-black/30
                    "
                  />
                </div>

                {/* BRAND */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Brand *
                  </label>

                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="e.g. OwnShoe"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-black/10
                      bg-gray-50
                      text-sm
                      text-black
                      outline-none
                      focus:bg-white
                      focus:border-black/30
                    "
                  />
                </div>

                {/* PRICE */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Original Price *
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="2999"
                      min="0"
                      className="
                        w-full
                        h-11
                        pl-9
                        pr-4
                        rounded-xl
                        border
                        border-black/10
                        bg-gray-50
                        text-sm
                        text-black
                        outline-none
                        focus:bg-white
                        focus:border-black/30
                      "
                    />
                  </div>
                </div>

                {/* SALE PRICE */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Sale Price
                    <span className="text-gray-400 font-medium ml-1">
                      (optional)
                    </span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="discountPrice"
                      value={form.discountPrice}
                      onChange={handleChange}
                      placeholder="2499"
                      min="0"
                      className="
                        w-full
                        h-11
                        pl-9
                        pr-4
                        rounded-xl
                        border
                        border-black/10
                        bg-gray-50
                        text-sm
                        text-black
                        outline-none
                        focus:bg-white
                        focus:border-black/30
                      "
                    />
                  </div>
                </div>

                {/* ================================================= */}
                {/* CATEGORY - UPDATED */}
                {/* ================================================= */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Category *
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-black/10
                      bg-gray-50
                      text-sm
                      text-black
                      outline-none
                      cursor-pointer
                      focus:bg-white
                      focus:border-black/30
                    "
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STOCK */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Stock *
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="50"
                    min="0"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-black/10
                      bg-gray-50
                      text-sm
                      text-black
                      outline-none
                      focus:bg-white
                      focus:border-black/30
                    "
                  />
                </div>

                {/* RATING */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Rating
                  </label>

                  <input
                    type="number"
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="4.5"
                    min="0"
                    max="5"
                    step="0.1"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-black/10
                      bg-gray-50
                      text-sm
                      text-black
                      outline-none
                      focus:bg-white
                      focus:border-black/30
                    "
                  />
                </div>

                {/* IMAGES */}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Image URLs *
                  </label>

                  <textarea
                    name="images"
                    value={form.images}
                    onChange={handleChange}
                    rows="3"
                    placeholder="https://image1.jpg, https://image2.jpg"
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-black/10
                      bg-gray-50
                      text-sm
                      text-black
                      outline-none
                      resize-none
                      focus:bg-white
                      focus:border-black/30
                    "
                  />

                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Separate multiple image URLs with commas.
                  </p>
                </div>

                {/* SIZES */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Sizes
                    <span className="text-gray-400 font-medium ml-1">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="sizes"
                    value={form.sizes}
                    onChange={handleChange}
                    placeholder="6, 7, 8, 9, 10"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-black/10
                      bg-gray-50
                      text-sm
                      text-black
                      outline-none
                      focus:bg-white
                      focus:border-black/30
                    "
                  />

                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Leave blank to automatically use default sizes{" "}
                    <strong className="text-gray-600">6, 7, 8, 9, 10</strong>.
                  </p>
                </div>

                {/* COLORS */}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Colors *
                  </label>

                  <input
                    type="text"
                    name="colors"
                    value={form.colors}
                    onChange={handleChange}
                    placeholder="Black, White, Red"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-black/10
                      bg-gray-50
                      text-sm
                      text-black
                      outline-none
                      focus:bg-white
                      focus:border-black/30
                    "
                  />

                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Example: Black, White, Red
                  </p>
                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Description *
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Write a detailed description about the shoe..."
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-black/10
                      bg-gray-50
                      text-sm
                      text-black
                      outline-none
                      resize-none
                      focus:bg-white
                      focus:border-black/30
                    "
                  />
                </div>
              </div>

              {/* ================================================= */}
              {/* FLAGS */}
              {/* ================================================= */}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* NEW */}

                <label
                  className={`
                    flex
                    items-center
                    gap-3
                    p-4
                    rounded-xl
                    border
                    cursor-pointer
                    transition
                    ${
                      form.isNew
                        ? "border-red-200 bg-red-50"
                        : "border-black/10 bg-gray-50"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={form.isNew}
                    onChange={handleChange}
                    className="w-4 h-4 accent-red-600"
                  />

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      New Arrival
                    </p>

                    <p className="text-[11px] text-gray-500">
                      Show this product in New Arrivals.
                    </p>
                  </div>
                </label>

                {/* BEST SELLER */}

                <label
                  className={`
                    flex
                    items-center
                    gap-3
                    p-4
                    rounded-xl
                    border
                    cursor-pointer
                    transition
                    ${
                      form.isBestSeller
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-black/10 bg-gray-50"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={form.isBestSeller}
                    onChange={handleChange}
                    className="w-4 h-4 accent-black"
                  />

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Best Seller
                    </p>

                    <p className="text-[11px] text-gray-500">
                      Show this product in Best Sellers.
                    </p>
                  </div>
                </label>
              </div>

              {/* ================================================= */}
              {/* BUTTONS */}
              {/* ================================================= */}

              <div className="mt-7 pt-5 border-t border-black/10 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
                    h-11
                    px-6
                    rounded-full
                    border
                    border-black/10
                    bg-white
                    text-sm
                    font-bold
                    text-gray-700
                    hover:bg-gray-100
                    transition
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    h-11
                    px-7
                    rounded-full
                    bg-black
                    text-white
                    text-sm
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:bg-red-600
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      {editingProduct ? "Update Product" : "Add Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
