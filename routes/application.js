const express = require('express');
const multer = require('multer');
const router = express.Router();
const { submitApplication } = require('../controllers/applicationController');

// Memory storage keeps the file as a buffer for text extraction; swap for
// diskStorage or a cloud-storage multer plugin if you'd rather stream
// straight to disk/S3. Either way, hand the buffer to documentExtraction.js.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post(
  '/',
  upload.fields([
    { name: 'offerLetter', maxCount: 1 },
    { name: 'report', maxCount: 1 }
  ]),
  submitApplication
);

module.exports = router;