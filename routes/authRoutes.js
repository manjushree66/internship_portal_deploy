const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

// =====================================================
// MAIN LOGIN ROUTE
// This is the route currently used by Login.jsx
// =====================================================

router.post("/login", authController.login);


// =====================================================
// ROLE-SPECIFIC LOGIN ROUTES
// Kept for compatibility with any other existing code
// =====================================================

router.post("/student/login", (req, res) => {
    req.body.role = "Student";
    return authController.login(req, res);
});

router.post("/faculty/login", (req, res) => {
    req.body.role = "Faculty";
    return authController.login(req, res);
});

router.post("/manager/login", (req, res) => {
    req.body.role = "Manager";
    return authController.login(req, res);
});

router.post("/admin/login", (req, res) => {
    req.body.role = "Admin";
    return authController.login(req, res);
});


module.exports = router;