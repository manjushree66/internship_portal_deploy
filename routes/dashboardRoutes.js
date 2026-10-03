const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.get(
    "/",
    verifyToken,
    requireRole("Student"),
    dashboardController.getDashboard
);

module.exports = router;