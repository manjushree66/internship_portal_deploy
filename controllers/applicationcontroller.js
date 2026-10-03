const Application = require('../models/Application');
const { runVerification } = require('../services/verificationPipeline');
const { extractOfferLetterText, extractReportText } = require('../services/documentExtraction');

/**
 * POST /api/applications
 * Expects multipart/form-data with the existing form fields plus two files:
 * `offerLetter` (PDF) and `report` (.docx). Adjust the field names below if
 * your existing upload middleware already names them differently.
 */
exports.submitApplication = async (req, res) => {
  try {
    const application = new Application(req.body);

    const offerLetterBuffer = req.files?.offerLetter?.[0]?.buffer;
    const reportBuffer = req.files?.report?.[0]?.buffer;

    const [offerLetterText, reportText] = await Promise.all([
      offerLetterBuffer ? extractOfferLetterText(offerLetterBuffer) : Promise.resolve(''),
      reportBuffer ? extractReportText(reportBuffer) : Promise.resolve('')
    ]);

    // TODO: persist offerLetterBuffer / reportBuffer to your actual file
    // storage (S3, GridFS, disk, whatever you already use) and set
    // application.offerLetterPath / application.reportPath to the result.
    // The verification pipeline only needs the extracted text, not the file
    // itself, so this can happen in parallel with the block above.

    const result = await runVerification(application.toObject(), offerLetterText, reportText);
    application.verification = result;

    await application.save();

    res.status(201).json({
      id: application._id,
      status: result.status,
      // Keep the student-facing message generic — don't expose internal
      // flag wording (e.g. blacklist reasons) to the applicant.
      message: result.status === 'approved'
        ? 'Application submitted and passed automated checks.'
        : 'Application submitted. It has been flagged for manual review by the department.'
    });
  } catch (err) {
    console.error('Application submission failed:', err);
    res.status(500).json({ error: 'Something went wrong while processing the application. Please try again.' });
  }
};