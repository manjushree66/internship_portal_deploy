const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const AdmZip = require('adm-zip');
const { XMLParser } = require('fast-xml-parser');

/**
 * Extract raw text from an uploaded offer letter PDF buffer.
 * Works well for text-based PDFs. Scanned/image-only PDFs will return
 * little or no text — if that turns out to be common, add an OCR step
 * (e.g. Tesseract.js) as a fallback when the returned text is very short.
 */
async function extractOfferLetterText(buffer) {
  try {
    const data = await pdfParse(buffer);
    return (data.text || '').trim();
  } catch (err) {
    console.error('Offer letter PDF extraction failed:', err.message);
    return '';
  }
}

/**
 * Extract raw text from an uploaded internship report .docx buffer.
 */
async function extractReportText(buffer) {
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    return (value || '').trim();
  } catch (err) {
    console.error('Report DOCX text extraction failed:', err.message);
    return '';
  }
}

/**
 * Best-effort structural check against the report guidelines:
 *  - page count: read from docProps/app.xml, which Word caches the last
 *    time the file was opened/saved in Word or a compatible editor. This is
 *    usually accurate but not guaranteed — it won't update if the file was
 *    only ever touched by a script. Treat a mismatch as a soft flag, not a
 *    hard fail.
 *  - margins: read from word/document.xml's <w:pgMar>, which is exact
 *    (unlike page count, this is stored precisely, not cached/estimated).
 *    Only checks the first section — documents with multiple sections
 *    (rare for this kind of report) would need each <w:sectPr> checked.
 *
 * For guaranteed-accurate page count and font checks across every
 * document, convert to PDF server-side (e.g. via a headless LibreOffice
 * call) and inspect that instead — more setup, fully reliable.
 */
async function extractReportFormatting(buffer) {
  const result = { pageCount: null, marginsOk: null };
  try {
    const zip = new AdmZip(buffer);
    const parser = new XMLParser({ ignoreAttributes: false });

    const appXmlEntry = zip.getEntry('docProps/app.xml');
    if (appXmlEntry) {
      const appXml = parser.parse(appXmlEntry.getData().toString('utf8'));
      const pages = appXml?.Properties?.Pages;
      if (pages != null) result.pageCount = Number(pages);
    }

    const documentXmlEntry = zip.getEntry('word/document.xml');
    if (documentXmlEntry) {
      const doc = parser.parse(documentXmlEntry.getData().toString('utf8'));
      const sectPr = doc?.['w:document']?.['w:body']?.['w:sectPr'];
      const pgMar = sectPr?.['w:pgMar'];
      if (pgMar) {
        const twipsFor2cm = 1134; // 2cm in twentieths of a point
        const tolerance = 60;     // ~0.1cm slack for rounding
        const keys = ['@_w:top', '@_w:bottom', '@_w:left', '@_w:right'];
        result.marginsOk = keys.every(k => {
          const val = parseInt(pgMar[k], 10);
          return !isNaN(val) && Math.abs(val - twipsFor2cm) <= tolerance;
        });
      }
    }
  } catch (err) {
    console.error('Report formatting check failed:', err.message);
  }
  return result;
}

module.exports = { extractOfferLetterText, extractReportText, extractReportFormatting };