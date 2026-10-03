const express = require("express");

const router = express.Router();

const facultyController = require("../controllers/facultyController");

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.get(
    "/applications",
    verifyToken,
    requireRole("Faculty"),
    facultyController.viewApplications
);

router.put(
    "/approve/:id",
    verifyToken,
    requireRole("Faculty"),
    facultyController.approveApplication
);

router.put(
    "/reject/:id",
    verifyToken,
    requireRole("Faculty"),
    facultyController.rejectApplication
);

router.post(
    "/grade",
    verifyToken,
    requireRole("Faculty"),
    facultyController.assignGrade
);

module.exports = router;