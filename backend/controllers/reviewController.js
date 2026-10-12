const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");


// =========================
// GET REVIEWS
// GET /api/reviews
// =========================

const getReviews = async (req, res) => {
  try {
    const { product } = req.query;

    let filter = {};

    // If product ID is provided,
    // fetch only reviews for that product
    if (product) {
      filter.product = product;
    }

    const reviews = await Review.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.error("Fetch reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};


// =========================
// CREATE REVIEW
// POST /api/reviews
// =========================

const createReview = async (req, res) => {
  try {
    const {
      user,
      product,
      rating,
      text,
    } = req.body;

    // Required fields
    if (!user || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: "User, rating and review text are required",
      });
    }

    // Check user
    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check product if provided
    if (product) {
      const existingProduct = await Product.findById(product);

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    // Create review
    const review = await Review.create({
      user,
      product: product || null,
      rating,
      text,
      isVerified: true,
    });

    // Populate user name
    await review.populate("user", "name");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });

  } catch (error) {
    console.error("Create review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};


module.exports = {
  getReviews,
  createReview,
};