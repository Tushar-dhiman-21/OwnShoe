const express = require("express");

const {
  getReviews,
  createReview,
} = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// GET REVIEWS
// GET /api/reviews
// =========================

router.get("/", getReviews);

// =========================
// CREATE REVIEW
// POST /api/reviews
// =========================

router.post("/", authMiddleware, createReview);

module.exports = router;