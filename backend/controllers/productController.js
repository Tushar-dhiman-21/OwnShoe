
const Product = require("../models/Product");

const normalizeCategory = (value) => {
  if (!value) return "";

  const normalized = String(value).trim().toLowerCase();

  const categoryMap = {
    "running shoes": "running",
    running: "running",
    sneakers: "sneakers",
    sports: "sports",
    "casual shoes": "casual",
    casual: "casual",
    "formal shoes": "formal",
    formal: "formal",
    boots: "boots",
    loafers: "loafers",
    sandals: "sandals",
    slides: "slides",
    "high tops": "high-tops",
    "high-tops": "high-tops",
    "high tops shoes": "high-tops",
    "slip-ons": "slip-ons",
    "slip ons": "slip-ons",
    "slip-ons shoes": "slip-ons",
    trainers: "trainers",
    sale: "sale",
  };

  return (
    categoryMap[normalized] ||
    normalized.replace(/\s+/g, "-")
  );
};

// ==========================================
// GET ALL PRODUCTS
// GET /api/products
// Returns all matching products by default
// ==========================================

const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      sort,
      newOnly,
      bestSellerOnly,
      page = 1,
      limit,
    } = req.query;

    const query = {};

    // SEARCH
    if (search && String(search).trim()) {
      const searchText = String(search).trim();

      query.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { brand: { $regex: searchText, $options: "i" } },
        { category: { $regex: searchText, $options: "i" } },
      ];
    }

    // CATEGORY
    const normalizedCategory = normalizeCategory(category);

    if (normalizedCategory && normalizedCategory !== "all") {
      query.category = normalizedCategory;
    }

    // BRAND
    if (brand && String(brand).trim()) {
      query.brand = {
        $regex: String(brand).trim(),
        $options: "i",
      };
    }

    // PRICE FILTER
    const parsedMinPrice =
      minPrice !== undefined && minPrice !== ""
        ? Number(minPrice)
        : null;

    const parsedMaxPrice =
      maxPrice !== undefined && maxPrice !== ""
        ? Number(maxPrice)
        : null;

    const hasMinPrice =
      parsedMinPrice !== null &&
      Number.isFinite(parsedMinPrice);

    const hasMaxPrice =
      parsedMaxPrice !== null &&
      Number.isFinite(parsedMaxPrice);

    if (hasMinPrice || hasMaxPrice) {
      const priceCondition = {};

      if (hasMinPrice) {
        priceCondition.$gte = parsedMinPrice;
      }

      if (hasMaxPrice) {
        priceCondition.$lte = parsedMaxPrice;
      }

      query.$or = [
        { price: priceCondition },
        { discountPrice: priceCondition },
      ];

      // Preserve search conditions when both are used.
      if (search && String(search).trim()) {
        const searchText = String(search).trim();

        query.$and = [
          {
            $or: [
              { name: { $regex: searchText, $options: "i" } },
              { brand: { $regex: searchText, $options: "i" } },
              { category: { $regex: searchText, $options: "i" } },
            ],
          },
          {
            $or: [
              { price: priceCondition },
              { discountPrice: priceCondition },
            ],
          },
        ];

        delete query.$or;
      }
    }

    // SIZE
    if (size !== undefined && size !== "") {
      const sizeValue = Number(size);

      if (Number.isFinite(sizeValue)) {
        query.sizes = sizeValue;
      }
    }

    // COLOR
    if (color && String(color).trim()) {
      query.colors = {
        $regex: String(color).trim(),
        $options: "i",
      };
    }

    // NEW ARRIVALS
    if (newOnly === "true") {
      query.isNew = true;
    }

    // BEST SELLERS
    if (bestSellerOnly === "true") {
      query.isBestSeller = true;
    }

    // SORTING
    let sortConfig = {};

    switch (String(sort || "featured").toLowerCase()) {
      case "price-asc":
        sortConfig = { price: 1 };
        break;

      case "price-desc":
        sortConfig = { price: -1 };
        break;

      case "rating":
        sortConfig = { rating: -1 };
        break;

      case "newest":
      case "new":
        sortConfig = { createdAt: -1 };
        break;

      default:
        sortConfig = { createdAt: -1 };
        break;
    }

    // PAGINATION
    // No limit provided = return all matching products.
    // A positive limit provided = use pagination.
    const pageNumber = Math.max(1, Number(page) || 1);

    const requestedLimit = Number(limit);

    const hasLimit =
      limit !== undefined &&
      limit !== "" &&
      Number.isFinite(requestedLimit) &&
      requestedLimit > 0;

    const total = await Product.countDocuments(query);

    let productsQuery = Product.find(query).sort(sortConfig);

    if (hasLimit) {
      const limitNumber = Math.floor(requestedLimit);
      const skip = (pageNumber - 1) * limitNumber;

      productsQuery = productsQuery
        .skip(skip)
        .limit(limitNumber);
    }

    const products = await productsQuery;

    // RESPONSE
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNumber,
      limit: hasLimit ? Math.floor(requestedLimit) : null,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ==========================================

const getSingleProduct = async (req, res) => {
  try {
    if (
      !req.params.id ||
      !/^[0-9a-fA-F]{24}$/.test(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE PRODUCT
// POST /api/products
// ==========================================

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ==========================================

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ==========================================

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
