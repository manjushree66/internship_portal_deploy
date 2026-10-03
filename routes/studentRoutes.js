const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const express = require("express");

const router = express.Router();

const studentController = require("../controllers/studentController");

// ============================================================
// STUDENT INTERNSHIP
// ============================================================

// Register Internship
router.post(
    "/register",
    verifyToken,
    upload.single("offerLetter"),
    studentController.registerInternship
);

// Track Internship Status
router.get(
    "/status/:srn",
    verifyToken,
    studentController.trackStatus
);


// ============================================================
// INTERNSHIP REPORT
// ============================================================

// 1. Get internship approval + report submission status
router.get(
    "/internship-report",
    verifyToken,
    studentController.getInternshipReportStatus
);

// 2. Submit internship report PDF
router.post(
    "/internship-report",
    verifyToken,
    upload.single("report"),
    studentController.submitInternshipReport
);

// 3. View submitted internship report PDF
router.get(
    "/internship-report/file",
    verifyToken,
    studentController.getInternshipReportFile
);


// ============================================================
// NOC
// ============================================================

router.post(
    "/request-noc",
    verifyToken,
    studentController.requestNOC
);


// ============================================================
// PROFILE
// ============================================================

// Get Student Profile
router.get(
    "/profile",
    verifyToken,
    studentController.getProfile
);

// Update Student Profile
router.put(
    "/profile",
    verifyToken,
    studentController.updateProfile
);


module.exports = router;