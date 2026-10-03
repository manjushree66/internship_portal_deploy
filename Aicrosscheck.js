const Anthropic = require('@anthropic-ai/sdk');

// Reads ANTHROPIC_API_KEY from process.env automatically.
const client = new Anthropic();

// Good default for this task. For high volume where cost matters more than
// nuance, claude-haiku-4-5-20251001 is a solid cheaper/faster alternative —
// this is a structured consistency check, not open-ended reasoning.
const MODEL = 'claude-sonnet-5';

function buildPrompt(app, offerLetterText, reportText) {
  const summary = {
    studentName: app.studentName,
    company: app.company,
    role: app.role,
    startDate: app.startDate,
    endDate: app.endDate
  };
  return [
    'You are helping a university records office check internal consistency of an internship credit application, purely for a verification workflow.',
    'Compare the form data below against the extracted offer letter text and report excerpt.',
    'Respond with ONLY compact JSON, no markdown fences, no commentary, in exactly this shape:',
    '{"companyNameMatch":true,"studentNameMatch":true,"dateConsistency":true,"roleMatch":true,"notes":"one short sentence"}',
    '',
    'Form data: ' + JSON.stringify(summary),
    '',
    'Offer letter text: ' + (offerLetterText || '(not provided)'),
    '',
    'Report excerpt: ' + (reportText ? reportText.slice(0, 4000) : '(not provided)')
  ].join('\n');
}

function fallbackTextCheck(app, offerLetterText, reportText) {
  const combined = ((offerLetterText || '') + ' ' + (reportText || '')).toLowerCase();
  return {
    available: false,
    companyNameMatch: app.company ? combined.includes(app.company.toLowerCase()) : null,
    studentNameMatch: app.studentName ? combined.includes(app.studentName.toLowerCase()) : null,
    roleMatch: app.role ? combined.includes(app.role.toLowerCase()) : null,
    dateConsistency: null,
    notes: 'AI check unavailable — used a plain text-match fallback instead'
  };
}

/**
 * Cross-checks the offer letter and report text against the form data.
 * Never throws — on any failure (network, bad JSON, rate limit) it falls
 * back to a simple substring-match check so the pipeline can always finish.
 */
async function aiCrossCheck(app, offerLetterText, reportText) {
  if (!offerLetterText && !reportText) {
    return { available: false, companyNameMatch: null, studentNameMatch: null, dateConsistency: null, roleMatch: null, notes: '' };
  }
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: buildPrompt(app, offerLetterText, reportText) }]
    });
    const text = message.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return { available: true, ...parsed };
  } catch (err) {
    console.error('AI cross-check failed, using fallback:', err.message);
    return fallbackTextCheck(app, offerLetterText, reportText);
  }
}

module.exports = { aiCrossCheck };