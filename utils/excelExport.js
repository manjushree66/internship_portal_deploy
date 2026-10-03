const ExcelJS = require('exceljs');

const STATUS_COLORS = {
  approved: 'FFE3F3F0',
  review: 'FFFBEEDD',
  rejected: 'FFFBE9E9'
};

async function generateApplicationsWorkbook(applications) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Verification log');

  sheet.columns = [
    { header: 'Student name', key: 'studentName', width: 22 },
    { header: 'SRN', key: 'srn', width: 16 },
    { header: 'Company', key: 'company', width: 26 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Top reason', key: 'topReason', width: 60 },
    { header: 'Total flags', key: 'flagCount', width: 12 },
    { header: 'Submitted', key: 'submittedAt', width: 20 }
  ];
  sheet.getRow(1).font = { bold: true };

  applications.forEach(app => {
    const v = app.verification || {};
    const flags = [...(v.hardFails || []), ...(v.softFlags || [])];
    const status = v.adminOverride?.status || v.status || 'pending';

    const row = sheet.addRow({
      studentName: app.studentName,
      srn: app.srn,
      company: app.company,
      status,
      topReason: flags[0] || 'No issues found',
      flagCount: flags.length,
      submittedAt: app.createdAt ? new Date(app.createdAt).toLocaleString() : ''
    });

    if (STATUS_COLORS[status]) {
      row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STATUS_COLORS[status] } };
    }
  });

  return workbook;
}

module.exports = { generateApplicationsWorkbook };