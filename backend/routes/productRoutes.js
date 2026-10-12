const express = require("express");

const {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ==========================================
// GET ALL PRODUCTS
// GET /api/products
// ==========================================

router.get("/", getAllProducts);

// ==========================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ==========================================

router.get("/:id", getSingleProduct);

// ==========================================
// CREATE PRODUCT
// POST /api/products
// ==========================================

router.post("/", authMiddleware, adminMiddleware, createProduct);

// ==========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ==========================================

router.put("/:id", authMiddleware, adminMiddleware, updateProduct);

// ==========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ==========================================

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;