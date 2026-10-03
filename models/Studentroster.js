const mongoose = require('mongoose');

// This collection stands in for a live link to the student records system.
// Load it once per semester from the registrar's export using
// scripts/importRoster.js — see the README for the exact command.
const StudentRosterSchema = new mongoose.Schema({
  srn: { type: String, required: true, unique: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  semester: String,
  cgpaOnFile: String
}, { timestamps: true });

module.exports = mongoose.model('StudentRoster', StudentRosterSchema);