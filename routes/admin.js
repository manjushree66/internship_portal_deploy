const express = require('express');
const router = express.Router();
const {
  listApplications,
  getApplication,
  overrideDecision,
  exportApplications
} = require('../controllers/adminController');

// Swap this for whatever auth middleware already protects your admin pages —
// these routes expose flag reasons and export the full applicant list, so
// they should never be reachable without it.
// const { requireAdmin } = require('../middleware/auth');
// router.use(requireAdmin);

router.get('/applications', listApplications);
router.get('/applications/export', exportApplications);
router.get('/applications/:id', getApplication);
router.patch('/applications/:id/override', overrideDecision);

module.exports = router;