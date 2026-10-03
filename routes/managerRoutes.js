const express = require("express");

const router = express.Router();

const managerController = require("../controllers/managerController");

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.get(
    "/students",
    verifyToken,
    requireRole("Manager"),
    managerController.viewStudents
);

router.put(
    "/evaluation-mode/:id",
    verifyToken,
    requireRole("Manager"),
    managerController.setEvaluationMode
);

router.post(
    "/evaluate",
    verifyToken,
    requireRole("Manager"),
    managerController.submitEvaluation
);

module.exports = router;