// Loads the official student roster export into the StudentRoster
// collection that Stage 3 of the pipeline matches applications against.
//
// Usage:  node scripts/importRoster.js path/to/roster.csv
// Expected CSV columns: srn, name, email, semester, cgpa
//
// Re-run this whenever the registrar sends an updated roster — it upserts
// by SRN, so existing records get refreshed rather than duplicated.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');
const StudentRoster = require('../models/StudentRoster');

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node importRoster.js <path-to-csv>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  const rows = parse(fs.readFileSync(resolvedPath), {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected. Importing ${rows.length} rows from ${resolvedPath}...`);

  let count = 0;
  for (const row of rows) {
    if (!row.srn || !row.name) continue;
    await StudentRoster.findOneAndUpdate(
      { srn: row.srn.trim().toUpperCase() },
      {
        srn: row.srn.trim().toUpperCase(),
        name: row.name.trim(),
        email: (row.email || '').trim().toLowerCase(),
        semester: row.semester || '',
        cgpaOnFile: row.cgpa || ''
      },
      { upsert: true }
    );
    count++;
  }

  console.log(`Done. Imported/updated ${count} roster records.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Roster import failed:', err);
  process.exit(1);
});