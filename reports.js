/* ============================================================
   EduTrack — reports.js
   Builds the attendance report table with search/filter, and
   exports the current view to CSV (Excel-compatible) or PDF.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('reportsTableBody');
  if (!tbody) return; // not on reports page

  const students = MockDB.get('students');
  const subjects = MockDB.get('subjects');
  const departments = MockDB.get('departments');
  let attendance = MockDB.get('attendance');

  const deptFilter = document.getElementById('reportDeptFilter');
  const rangeFilter = document.getElementById('reportRangeFilter');
  const searchInput = document.getElementById('reportSearch');

  // populate department filter
  deptFilter.innerHTML = `<option value="all">All Departments</option>` +
    departments.map(d => `<option value="${d.code}">${d.name}</option>`).join('');

  function getRows() {
    const dept = deptFilter.value;
    const range = parseInt(rangeFilter.value, 10);
    const search = searchInput.value.trim().toLowerCase();
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - range);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    return attendance
      .filter(a => a.date >= cutoffStr)
      .map(a => {
        const student = students.find(s => s.id === a.studentId);
        const subject = subjects.find(s => s.id === a.subjectId);
        return { ...a, studentName: student?.name || '—', roll: student?.roll || '—', dept: student?.dept || '—', subjectName: subject?.name || '—' };
      })
      .filter(r => (dept === 'all' || r.dept === dept))
      .filter(r => !search || r.studentName.toLowerCase().includes(search) || r.roll.toLowerCase().includes(search))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function render() {
    const rows = getRows();
    tbody.innerHTML = rows.length ? rows.map(r => `
      <tr>
        <td>${r.date}</td>
        <td>${r.studentName}</td>
        <td>${r.roll}</td>
        <td>${r.dept}</td>
        <td>${r.subjectName}</td>
        <td><span class="badge ${r.status}">${r.status === 'present' ? 'Present' : 'Absent'}</span></td>
      </tr>`).join('') : `<tr><td colspan="6" style="text-align:center;color:var(--c-muted);padding:1.6rem;">No records match your filters.</td></tr>`;

    document.getElementById('reportCount').textContent = rows.length + ' records';
  }

  [deptFilter, rangeFilter].forEach(el => el.addEventListener('change', render));
  searchInput.addEventListener('input', render);
  render();

  /* ---------- Export to CSV (Excel-compatible) ---------- */
  document.getElementById('exportExcelBtn').addEventListener('click', () => {
    const rows = getRows();
    const header = ['Date', 'Student', 'Roll No', 'Department', 'Subject', 'Status'];
    const csvLines = [header.join(',')].concat(
      rows.map(r => [r.date, `"${r.studentName}"`, r.roll, r.dept, `"${r.subjectName}"`, r.status].join(','))
    );
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  /* ---------- Export to PDF ---------- */
  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    if (!window.jspdf) { alert('PDF library failed to load. Check your internet connection.'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const rows = getRows();
    doc.setFontSize(16);
    doc.text('EduTrack — Attendance Report', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated ${new Date().toLocaleString()} • ${rows.length} records`, 14, 25);

    let y = 36;
    doc.setFontSize(9);
    doc.setTextColor(30);
    const colX = [14, 40, 90, 115, 140, 175];
    ['Date', 'Student', 'Roll No', 'Dept', 'Subject', 'Status'].forEach((h, i) => doc.text(h, colX[i], y));
    y += 6;
    rows.slice(0, 40).forEach(r => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(r.date, colX[0], y);
      doc.text(r.studentName.slice(0, 16), colX[1], y);
      doc.text(r.roll, colX[2], y);
      doc.text(r.dept, colX[3], y);
      doc.text(r.subjectName.slice(0, 14), colX[4], y);
      doc.text(r.status, colX[5], y);
      y += 6;
    });
    doc.save(`attendance-report-${Date.now()}.pdf`);
  });
});
