const express = require("express");
const router = express.Router();

const { getCustomers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/customers", authMiddleware, adminMiddleware, getCustomers);

module.exports = router;