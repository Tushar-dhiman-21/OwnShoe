const Product = require("../models/Product");

const normalizeCategory = (value) => {
  if (!value) return "";

  const normalized = String(value).trim().toLowerCase();

  const categoryMap = {
    "running shoes": "running",
    "running": "running",
    "sneakers": "sneakers",
    "sports": "sports",
    "casual shoes": "casual",
    "casual": "casual",
    "formal shoes": "formal",
    "formal": "formal",
    "boots": "boots",
    "loafers": "loafers",
    "sandals": "sandals",
    "slides": "slides",
    "high tops": "high-tops",
    "high-tops": "high-tops",
    "high tops shoes": "high-tops",
    "slip-ons": "slip-ons",
    "slip ons": "slip-ons",
    "slip-ons shoes": "slip-ons",
    "trainers": "trainers",
    "sale": "sale",
  };

  return categoryMap[normalized] || normalized.replace(/\s+/g, "-");
};

const getPriceValue = (product) => {
  const basePrice = Number(product?.discountPrice || product?.price || 0);
  return Number.isFinite(basePrice) ? basePrice : 0;
};

// ==========================================
// GET ALL PRODUCTS
// GET /api/products
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
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      const searchText = String(search).trim();

      if (searchText) {
        query.$or = [
          { name: { $regex: searchText, $options: "i" } },
          { brand: { $regex: searchText, $options: "i" } },
          { category: { $regex: searchText, $options: "i" } },
        ];
      }
    }

    const normalizedCategory = normalizeCategory(category);
    if (normalizedCategory && normalizedCategory !== "all") {
      query.category = normalizedCategory;
    }

    if (brand) {
      query.brand = { $regex: String(brand).trim(), $options: "i" };
    }

    const parsedMinPrice = Number(minPrice);
    const parsedMaxPrice = Number(maxPrice);

    if (Number.isFinite(parsedMinPrice) || Number.isFinite(parsedMaxPrice)) {
      const min = Number.isFinite(parsedMinPrice) ? parsedMinPrice : 0;
      const max = Number.isFinite(parsedMaxPrice) ? parsedMaxPrice : Number.MAX_SAFE_INTEGER;

      query.$and = [
        {
          $or: [
            { discountPrice: { $exists: false } },
            { discountPrice: null },
            { discountPrice: { $gte: 0 } },
          ],
        },
        {
          $or: [
            { price: { $gte: min, $lte: max } },
            { discountPrice: { $gte: min, $lte: max } },
          ],
        },
      ];
    }

    if (size) {
      const sizeValue = Number(size);
      if (Number.isFinite(sizeValue)) {
        query.sizes = sizeValue;
      }
    }

    if (color) {
      const colorValue = String(color).trim();
      if (colorValue) {
        query.colors = { $regex: colorValue, $options: "i" };
      }
    }

    if (newOnly === "true") {
      query.isNew = true;
    }

    if (bestSellerOnly === "true") {
      query.isBestSeller = true;
    }

    let productsQuery = Product.find(query);

    const sortConfig = {};
    switch (String(sort || "featured").toLowerCase()) {
      case "price-asc":
        sortConfig.price = 1;
        break;
      case "price-desc":
        sortConfig.price = -1;
        break;
      case "rating":
        sortConfig.rating = -1;
        break;
      case "newest":
      case "new":
        sortConfig.createdAt = -1;
        break;
      default:
        sortConfig.createdAt = -1;
        break;
    }

    productsQuery = productsQuery.sort(sortConfig);

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 20);

    const total = await Product.countDocuments(query);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await productsQuery.skip(skip).limit(limitNumber);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      products,
    });
  } catch (error) {
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
    if (!req.params.id || !/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
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
    const product = await Product.findByIdAndDelete(req.params.id);

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