const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

const studentController = require("../controllers/studentController");

// ============================================================
// STUDENT INTERNSHIP
// ============================================================

// Register Internship
router.post(
    "/register",
    verifyToken,
    requireRole("Student"),
    upload.single("offerLetter"),
    studentController.registerInternship
);


// ============================================================
// TRACK INTERNSHIP STATUS
// ============================================================

// Track Internship Status
router.get(
    "/status/:srn",
    verifyToken,
    requireRole("Student"),
    studentController.trackStatus
);


// ============================================================
// INTERNSHIP REPORT
// ============================================================

// Get internship approval + report submission status
router.get(
    "/internship-report",
    verifyToken,
    requireRole("Student"),
    studentController.getInternshipReportStatus
);

// Submit internship report PDF
router.post(
    "/internship-report",
    verifyToken,
    requireRole("Student"),
    upload.single("report"),
    studentController.submitInternshipReport
);

// View submitted internship report PDF
router.get(
    "/internship-report/file",
    verifyToken,
    requireRole("Student"),
    studentController.getInternshipReportFile
);


// ============================================================
// STUDENT PROFILE
// ============================================================

// Get Student Profile
router.get(
    "/profile",
    verifyToken,
    requireRole("Student"),
    studentController.getProfile
);

// Update Student Profile
router.put(
    "/profile",
    verifyToken,
    requireRole("Student"),
    studentController.updateProfile
);


module.exports = router;