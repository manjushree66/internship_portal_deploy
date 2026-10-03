const mongoose = require('mongoose');

// One entry per automated check. type 'hard' = would block credit approval,
// 'soft' = worth a human look but not disqualifying on its own.
const CheckItemSchema = new mongoose.Schema({
  text: String,
  type: { type: String, enum: ['hard', 'soft'] }
}, { _id: false });

const VerificationResultSchema = new mongoose.Schema({
  status: { type: String, enum: ['approved', 'review', 'rejected', 'pending'], default: 'pending' },
  stages: {
    intake: [CheckItemSchema],
    fields: [CheckItemSchema],
    roster: [CheckItemSchema],
    company: [CheckItemSchema],
    report: [CheckItemSchema]
  },
  hardFails: [String],
  softFlags: [String],
  aiNotes: String,
  processedAt: Date,
  // Admins can override the automated recommendation without losing the
  // original evidence trail above — both stay on the record.
  adminOverride: {
    status: { type: String, enum: ['approved', 'review', 'rejected'] },
    reason: String,
    overriddenBy: String,
    overriddenAt: Date
  }
}, { _id: false });

const ApplicationSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, trim: true, lowercase: true },
  srn: { type: String, required: true, trim: true, uppercase: true },
  cgpa: String,
  semester: String,
  startDate: Date,
  endDate: Date,
  campus: String,
  company: String,
  companyWebsite: String,
  role: String,
  managerName: String,
  managerEmail: String,
  mentorName: String,
  mentorEmail: String,
  internshipNature: { type: String, enum: ['Paid', 'Unpaid'] },
  category: { type: String, enum: ['Industry', 'Research'] },
  researchCenter: String,
  otherResearchCenter: String,
  stipend: String,
  offerLetterPath: String,   // wherever you end up storing the uploaded PDF
  reportPath: String,        // wherever you end up storing the uploaded .docx
  verification: VerificationResultSchema
}, { timestamps: true });

ApplicationSchema.index({ srn: 1, createdAt: -1 });
ApplicationSchema.index({ 'verification.status': 1 });

module.exports = mongoose.model('Application', ApplicationSchema);