const mongoose = require('mongoose');

// Grows over time as admins confirm a company is a paper-certificate mill,
// charges students a fee, or otherwise fails manual review. Every match here
// is an automatic hard-fail in the verification pipeline.
const CompanyBlacklistSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true, index: true },
  reason: String,
  addedBy: String
}, { timestamps: true });

module.exports = mongoose.model('CompanyBlacklist', CompanyBlacklistSchema);