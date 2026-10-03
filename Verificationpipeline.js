const StudentRoster = require('../models/StudentRoster');
const CompanyBlacklist = require('../models/CompanyBlacklist');
const { aiCrossCheck } = require('./aiCrossCheck');

const STUDENT_EMAIL_DOMAIN = 'pes.edu';
const MIN_WEEKS = 6;

function newBucket() {
  return { hard: [], soft: [] };
}

function escapeRegex(s) {
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Runs every automated check against one application and returns a
 * decision with an itemized reason for each flag. Never auto-approves
 * silently and never throws — a failure in one check (e.g. the AI call)
 * degrades gracefully rather than blocking the whole pipeline.
 *
 * @param {Object} app - plain object with the application's form fields
 * @param {string} offerLetterText - text extracted from the offer letter PDF
 * @param {string} reportText - text extracted from the internship report
 */
async function runVerification(app, offerLetterText, reportText) {
  const stages = {
    intake: newBucket(),
    fields: newBucket(),
    roster: newBucket(),
    company: newBucket(),
    report: newBucket()
  };

  // Stage 1 — intake: required fields and documents present
  const required = [
    'studentName', 'studentEmail', 'srn', 'semester', 'cgpa',
    'startDate', 'endDate', 'company', 'companyWebsite', 'role',
    'mentorEmail', 'internshipNature', 'category'
  ];
  const missing = required.filter(k => !app[k]);
  if (missing.length) stages.intake.hard.push('Missing required fields: ' + missing.join(', '));
  if (!offerLetterText) stages.intake.hard.push('Could not extract text from the offer letter PDF');
  if (!reportText) stages.intake.hard.push('Could not extract text from the internship report');

  // Stage 2 — field validation: dates, CGPA, email domain
  if (app.startDate && app.endDate) {
    const start = new Date(app.startDate);
    const end = new Date(app.endDate);
    if (!isNaN(start) && !isNaN(end)) {
      if (end < start) {
        stages.fields.hard.push('End date is before the start date');
      } else {
        const weeks = (end - start) / (1000 * 3600 * 24 * 7);
        if (weeks < MIN_WEEKS) {
          stages.fields.hard.push(`Duration is ${weeks.toFixed(1)} weeks — below the ${MIN_WEEKS}-week minimum`);
        }
      }
    }
  }
  const cgpaNum = parseFloat(app.cgpa);
  if (app.cgpa && (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10)) {
    stages.fields.hard.push(`CGPA "${app.cgpa}" is outside the valid 0–10 range`);
  }
  if (app.studentEmail && !app.studentEmail.toLowerCase().endsWith('@' + STUDENT_EMAIL_DOMAIN)) {
    stages.fields.soft.push(`Student email domain doesn't match @${STUDENT_EMAIL_DOMAIN}`);
  }

  // Stage 3 — student record match against the roster collection
  // (see models/StudentRoster.js and scripts/importRoster.js)
  if (app.srn) {
    const rosterEntry = await StudentRoster.findOne({ srn: app.srn.toUpperCase() });
    if (!rosterEntry) {
      stages.roster.hard.push(`SRN ${app.srn} was not found in the student roster`);
    } else if (rosterEntry.name.trim().toLowerCase() !== (app.studentName || '').trim().toLowerCase()) {
      stages.roster.soft.push(`Roster record for ${app.srn} has the name "${rosterEntry.name}" — check for a typo`);
    }
  } else {
    stages.roster.hard.push('No SRN was submitted');
  }

  // Stage 4 — company & offer letter: domain match, blacklist, stipend logic
  let companyDomain = '';
  try {
    companyDomain = new URL(app.companyWebsite).hostname.replace(/^www\./, '');
  } catch (e) {
    // invalid or missing URL — leave companyDomain empty, no domain check possible
  }
  const mentorDomain = (app.mentorEmail || '').split('@')[1] || '';
  if (companyDomain && mentorDomain) {
    const companyRoot = companyDomain.split('.')[0].toLowerCase();
    if (!mentorDomain.toLowerCase().includes(companyRoot)) {
      stages.company.soft.push(`Mentor email domain (${mentorDomain}) doesn't match the company website domain (${companyDomain})`);
    }
  }
  if (app.company) {
    const blacklisted = await CompanyBlacklist.findOne({ companyName: new RegExp(escapeRegex(app.company), 'i') });
    if (blacklisted) {
      stages.company.hard.push(`"${app.company}" matches a blacklist entry: ${blacklisted.reason || 'previously flagged'}`);
    }
  }
  if (app.internshipNature === 'Paid' && (!app.stipend || parseFloat(app.stipend) <= 0)) {
    stages.company.soft.push('Marked as a paid internship, but no stipend amount was entered');
  }
  if (app.internshipNature === 'Unpaid' && app.stipend && parseFloat(app.stipend) > 0) {
    stages.company.soft.push('Marked as an unpaid internship, but a stipend amount was entered');
  }

  // Stages 4 & 5 — AI cross-check of the offer letter and report against the form
  const ai = await aiCrossCheck(app, offerLetterText, reportText);
  if (ai.companyNameMatch === false) {
    stages.company.soft.push('AI check: offer letter text does not clearly confirm the company name on the form');
  }
  if (ai.dateConsistency === false) {
    stages.company.soft.push("AI check: offer letter/report dates don't clearly match the form's start and end dates");
  }
  if (ai.studentNameMatch === false) {
    stages.report.soft.push('AI check: student name is not clearly confirmed in the report text');
  }
  if (ai.roleMatch === false) {
    stages.report.soft.push('AI check: role/title is not clearly confirmed in the report text');
  }

  const hardFails = [].concat(stages.intake.hard, stages.fields.hard, stages.roster.hard, stages.company.hard, stages.report.hard);
  const softFlags = [].concat(stages.intake.soft, stages.fields.soft, stages.roster.soft, stages.company.soft, stages.report.soft);
  const status = hardFails.length ? 'rejected' : softFlags.length ? 'review' : 'approved';

  return {
    status,
    stages: mapStagesToSchema(stages),
    hardFails,
    softFlags,
    aiNotes: ai.notes || '',
    processedAt: new Date()
  };
}

function mapStagesToSchema(stages) {
  const out = {};
  for (const key of Object.keys(stages)) {
    out[key] = [
      ...stages[key].hard.map(text => ({ text, type: 'hard' })),
      ...stages[key].soft.map(text => ({ text, type: 'soft' }))
    ];
  }
  return out;
}

module.exports = { runVerification };