const User = require("../models/User");

// =========================
// GET CUSTOMERS
// GET /api/users/customers
// =========================

const getCustomers = async (req, res) => {
  try {
    const customers = await User.find(
      { role: "customer" },
      "-password"
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });

  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomers,
};