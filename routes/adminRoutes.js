const express = require("express");

const router = express.Router();

const adminController = require("../controllers/adminController");

// ======================================================
// APPLICATION MANAGEMENT
// ======================================================

// Get all applications
// GET /api/admin/applications
router.get(
    "/applications",
    adminController.listApplications
);

// Export applications to Excel
// GET /api/admin/applications/export
router.get(
    "/applications/export",
    adminController.exportApplications
);

// Get one application
// GET /api/admin/applications/:id
router.get(
    "/applications/:id",
    adminController.getApplication
);

// Override automated verification decision
// PATCH /api/admin/applications/:id/override
router.patch(
    "/applications/:id/override",
    adminController.overrideDecision
);


// ======================================================
// FACULTY MANAGEMENT
// ======================================================

// Get all faculty
// GET /api/admin/faculty
router.get(
    "/faculty",
    adminController.getFaculty
);

// Assign scrutiny faculty
// PATCH /api/admin/faculty/:id/scrutiny
router.patch(
    "/faculty/:id/scrutiny",
    adminController.assignScrutinyFaculty
);


// ======================================================
// STUDENT OVERVIEW
// ======================================================

// Get student overview
// GET /api/admin/student-overview
router.get(
    "/student-overview",
    adminController.getStudentOverview
);


module.exports = router;