const puppeteer = require('puppeteer');

const generateReportCard = async (student, grades, attendance) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial; padding: 40px; }
        .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
        .student-info { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #667eea; color: white; }
        .gpa { font-size: 24px; color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📚 Student Report Card</h1>
        <h2>Academic Year 2025-2026</h2>
      </div>
      <div class="student-info">
        <p><strong>Name:</strong> ${student.user?.fullName}</p>
        <p><strong>Roll Number:</strong> ${student.rollNumber}</p>
        <p><strong>Class:</strong> ${student.class} - Section ${student.section}</p>
        <p><strong>GPA:</strong> <span class="gpa">${student.gpa || 0}</span></p>
      </div>
      <h3>Grades</h3>
      <table>
        <tr>
          <th>Subject</th>
          <th>Exam</th>
          <th>Marks</th>
          <th>Grade Point</th>
        </tr>
        ${grades.map(g => `
          <tr>
            <td>${g.subject}</td>
            <td>${g.examType}</td>
            <td>${g.marksObtained}/${g.totalMarks}</td>
            <td>${g.gradePoint}</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;

  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdf;
};

module.exports = { generateReportCard };