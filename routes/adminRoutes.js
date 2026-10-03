const express = require("express");

const router = express.Router();

const adminController = require("../controllers/adminController");

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// ======================================================
// APPLICATION MANAGEMENT
// ======================================================

// Get all applications
// GET /api/admin/applications
router.get(
    "/applications",
    verifyToken,
    requireRole("Admin"),
    adminController.listApplications
);

// Export applications to Excel
// GET /api/admin/applications/export
router.get(
    "/applications/export",
    verifyToken,
    requireRole("Admin"),
    adminController.exportApplications
);

// Get one application
// GET /api/admin/applications/:id
router.get(
    "/applications/:id",
    verifyToken,
    requireRole("Admin"),
    adminController.getApplication
);

// Override automated verification decision
// PATCH /api/admin/applications/:id/override
router.patch(
    "/applications/:id/override",
    verifyToken,
    requireRole("Admin"),
    adminController.overrideDecision
);


// ======================================================
// FACULTY MANAGEMENT
// ======================================================

// Get all faculty
// GET /api/admin/faculty
router.get(
    "/faculty",
    verifyToken,
    requireRole("Admin"),
    adminController.getFaculty
);

// Create faculty
// POST /api/admin/faculty/create
router.post(
    "/faculty/create",
    verifyToken,
    requireRole("Admin"),
    adminController.createFaculty
);

// Assign scrutiny faculty
// PATCH /api/admin/faculty/:id/scrutiny
router.patch(
    "/faculty/:id/scrutiny",
    verifyToken,
    requireRole("Admin"),
    adminController.assignScrutinyFaculty
);


// ======================================================
// STUDENT OVERVIEW
// ======================================================

// Get student overview
// GET /api/admin/student-overview
router.get(
    "/student-overview",
    verifyToken,
    requireRole("Admin"),
    adminController.getStudentOverview
);


// ======================================================
// INTERNSHIP → FACULTY ASSIGNMENT
// ======================================================

// Assign an internship to a faculty member
// PUT /api/admin/internship/:id/assign-faculty
router.put(
    "/internship/:id/assign-faculty",
    verifyToken,
    requireRole("Admin"),
    adminController.assignInternshipFaculty
);


// ======================================================
// GRADE RELEASE
// ======================================================

// Release a student's grade
// PUT /api/admin/release-grade/:id
router.put(
    "/release-grade/:id",
    verifyToken,
    requireRole("Admin"),
    adminController.releaseGrade
);


module.exports = router;