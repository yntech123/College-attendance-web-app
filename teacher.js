/* ============================================================
   EduTrack — teacher.js
   Department/Year/Section/Subject selection, roll-call marking,
   saving attendance, and recent attendance history.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const deptSelect = document.getElementById('filterDept');
  const yearSelect = document.getElementById('filterYear');
  const sectionSelect = document.getElementById('filterSection');
  const subjectSelect = document.getElementById('filterSubject');
  const rollList = document.getElementById('rollList');
  const saveBtn = document.getElementById('saveAttendanceBtn');
  const saveMsg = document.getElementById('saveAttendanceMsg');
  const historyBody = document.getElementById('historyTableBody');

  if (!rollList) return; // not on teacher dashboard

  const subjects = MockDB.get('subjects');

  function populateSubjects() {
    const dept = deptSelect.value;
    const year = yearSelect.value;
    const filtered = subjects.filter(s => s.dept === dept && s.year === year);
    subjectSelect.innerHTML = filtered.length
      ? filtered.map(s => `<option value="${s.id}">${s.name}</option>`).join('')
      : `<option value="">No subjects</option>`;
  }
  populateSubjects();
  deptSelect.addEventListener('change', populateSubjects);
  yearSelect.addEventListener('change', populateSubjects);

  const currentMarks = {}; // studentId -> 'present' | 'absent'

  function renderRoll() {
    const dept = deptSelect.value;
    const year = yearSelect.value;
    const section = sectionSelect.value;
    const students = MockDB.get('students').filter(s => s.dept === dept && s.year === year && s.section === section);

    rollList.innerHTML = students.length ? students.map(s => {
      currentMarks[s.id] = currentMarks[s.id] || 'present';
      return `
      <div class="roll-item" data-student="${s.id}">
        <div class="roll-student">
          <img src="${s.photo}" alt="">
          <div><strong>${s.name}</strong><small>${s.roll}</small></div>
        </div>
        <div class="attend-toggle">
          <button class="present-btn ${currentMarks[s.id] === 'present' ? 'active' : ''}" data-status="present">Present</button>
          <button class="absent-btn ${currentMarks[s.id] === 'absent' ? 'active' : ''}" data-status="absent">Absent</button>
        </div>
      </div>`;
    }).join('') : `<p style="color:var(--c-muted);text-align:center;padding:2rem 0;">No students found for this Department / Year / Section.</p>`;
  }
  renderRoll();
  [deptSelect, yearSelect, sectionSelect].forEach(sel => sel.addEventListener('change', renderRoll));

  rollList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-status]');
    if (!btn) return;
    const item = btn.closest('.roll-item');
    const studentId = item.dataset.student;
    currentMarks[studentId] = btn.dataset.status;
    item.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  saveBtn.addEventListener('click', () => {
    const subjectId = subjectSelect.value;
    if (!subjectId) { saveMsg.textContent = 'Select a subject first.'; saveMsg.className = 'form-msg error'; return; }
    const today = new Date().toISOString().slice(0, 10);
    const attendance = MockDB.get('attendance').filter(a => !(a.date === today && a.subjectId === subjectId && currentMarks[a.studentId]));
    Object.entries(currentMarks).forEach(([studentId, status]) => {
      attendance.push({ studentId, subjectId, date: today, status });
    });
    MockDB.set('attendance', attendance);

    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
    saveMsg.textContent = `Attendance saved for ${Object.keys(currentMarks).length} students on ${today}.`;
    saveMsg.className = 'form-msg success';
    renderHistory();
    setTimeout(() => { saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Attendance'; }, 2000);
  });

  function renderHistory() {
    if (!historyBody) return;
    const attendance = MockDB.get('attendance')
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 12);
    const students = MockDB.get('students');
    const subs = MockDB.get('subjects');
    historyBody.innerHTML = attendance.map(a => {
      const student = students.find(s => s.id === a.studentId);
      const subject = subs.find(s => s.id === a.subjectId);
      return `<tr>
        <td>${a.date}</td>
        <td>${student ? student.name : '—'}</td>
        <td>${subject ? subject.name : '—'}</td>
        <td><span class="badge ${a.status}">${a.status === 'present' ? 'Present' : 'Absent'}</span></td>
      </tr>`;
    }).join('') || `<tr><td colspan="4" style="text-align:center;color:var(--c-muted);padding:1.5rem;">No history yet.</td></tr>`;
  }
  renderHistory();
});
