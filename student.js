/* ============================================================
   EduTrack — student.js
   Renders the logged-in student's attendance percentage,
   subject-wise breakdown, monthly calendar, trend chart and history.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const ringNum = document.getElementById('studentOverallPct');
  if (!ringNum) return; // not on student dashboard

  const students = MockDB.get('students');
  const session = JSON.parse(localStorage.getItem('et_session') || 'null');
  // Demo mapping: fall back to the seeded student "Aditi Sharma" if no match
  const student = students.find(s => session && s.email === session.email) || students[0];
  document.querySelectorAll('.student-name-display').forEach(el => el.textContent = student.name);
  document.querySelectorAll('.student-roll-display').forEach(el => el.textContent = student.roll);
  document.querySelectorAll('.student-photo-display').forEach(el => el.src = student.photo);

  const subjects = MockDB.get('subjects').filter(s => s.dept === student.dept);
  const attendance = MockDB.get('attendance').filter(a => a.studentId === student.id);

  /* ---------- Overall percentage ring ---------- */
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const pct = total ? Math.round((present / total) * 100) : 0;

  ringNum.textContent = pct + '%';
  const ringProgress = document.getElementById('studentRingProgress');
  if (ringProgress) {
    const circumference = 2 * Math.PI * 120;
    ringProgress.style.strokeDasharray = circumference;
    const offset = circumference - (pct / 100) * circumference;
    requestAnimationFrame(() => { ringProgress.style.strokeDashoffset = offset; });
  }

  /* ---------- Subject-wise bars ---------- */
  const subjectWrap = document.getElementById('subjectBreakdown');
  if (subjectWrap) {
    subjectWrap.innerHTML = subjects.map(sub => {
      const recs = attendance.filter(a => a.subjectId === sub.id);
      const p = recs.filter(r => r.status === 'present').length;
      const subPct = recs.length ? Math.round((p / recs.length) * 100) : 0;
      return `
      <div class="subject-row">
        <div class="subject-name">${sub.name}</div>
        <div class="progress-track" style="flex:1;"><div class="progress-fill" style="width:${subPct}%; ${subPct < 75 ? 'background:linear-gradient(90deg,#e63946,#ff8fa3);' : ''}"></div></div>
        <div class="subject-pct">${subPct}%</div>
      </div>`;
    }).join('');
  }

  /* ---------- Calendar (current month) ---------- */
  const calendarEl = document.getElementById('studentCalendar');
  if (calendarEl) {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    let html = dayLabels.map(d => `<div class="cal-head">${d}</div>`).join('');
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day muted"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toISOString().slice(0, 10);
      const rec = attendance.find(a => a.date === dateStr);
      let cls = 'cal-day';
      if (rec) cls += rec.status === 'present' ? ' present' : ' absent';
      if (d === now.getDate()) cls += ' today';
      html += `<div class="${cls}" title="${dateStr}">${d}</div>`;
    }
    calendarEl.innerHTML = html;
  }

  /* ---------- Trend chart ---------- */
  const chartCtx = document.getElementById('studentTrendChart');
  if (chartCtx && window.Chart) {
    Chart.defaults.color = 'rgba(238,240,255,0.65)';
    const last14 = [...Array(14)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i));
      return d.toISOString().slice(0, 10);
    });
    const runningPct = last14.map(dateStr => {
      const upToDate = attendance.filter(a => a.date <= dateStr);
      if (!upToDate.length) return null;
      return Math.round((upToDate.filter(a => a.status === 'present').length / upToDate.length) * 100);
    });
    new Chart(chartCtx, {
      type: 'line',
      data: {
        labels: last14.map(d => d.slice(5)),
        datasets: [{
          label: 'Cumulative attendance %',
          data: runningPct,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168,85,247,0.15)',
          tension: .4, fill: true, pointRadius: 3
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
    });
  }

  /* ---------- History table ---------- */
  const historyBody = document.getElementById('studentHistoryBody');
  if (historyBody) {
    const subjectMap = Object.fromEntries(MockDB.get('subjects').map(s => [s.id, s.name]));
    historyBody.innerHTML = attendance
      .slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15)
      .map(a => `<tr><td>${a.date}</td><td>${subjectMap[a.subjectId] || '—'}</td><td><span class="badge ${a.status}">${a.status === 'present' ? 'Present' : 'Absent'}</span></td></tr>`)
      .join('') || `<tr><td colspan="3" style="text-align:center;color:var(--c-muted);padding:1.5rem;">No records yet.</td></tr>`;
  }
});
