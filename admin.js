/* ============================================================
   EduTrack — admin.js
   Populates the admin dashboard: KPIs, Chart.js analytics,
   and CRUD tables for students, teachers, departments, subjects.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const students = MockDB.get('students');
  const teachers = MockDB.get('teachers');
  const departments = MockDB.get('departments');
  const subjects = MockDB.get('subjects');
  const attendance = MockDB.get('attendance');

  /* ---------- KPI numbers ---------- */
  const setText = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  setText('#kpiStudents', students.length);
  setText('#kpiTeachers', teachers.length);
  setText('#kpiDepartments', departments.length);
  const overallPct = attendance.length
    ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
    : 0;
  setText('#kpiAttendance', overallPct + '%');

  /* ---------- Charts ---------- */
  if (window.Chart) {
    Chart.defaults.color = 'rgba(238,240,255,0.65)';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.08)';

    // Weekly attendance trend (last 7 days)
    const trendCtx = document.getElementById('attendanceTrendChart');
    if (trendCtx) {
      const days = [...Array(7)].map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d;
      });
      const labels = days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
      const data = days.map(d => {
        const key = d.toISOString().slice(0, 10);
        const recs = attendance.filter(a => a.date === key);
        if (!recs.length) return null;
        return Math.round((recs.filter(r => r.status === 'present').length / recs.length) * 100);
      });
      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Attendance %',
            data,
            fill: true,
            tension: .4,
            borderColor: '#4cc9f0',
            backgroundColor: 'rgba(76,201,240,0.15)',
            pointBackgroundColor: '#7209b7',
            pointRadius: 4
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,.06)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Department distribution (doughnut)
    const deptCtx = document.getElementById('deptDistributionChart');
    if (deptCtx) {
      new Chart(deptCtx, {
        type: 'doughnut',
        data: {
          labels: departments.map(d => d.code),
          datasets: [{
            data: departments.map(d => d.students),
            backgroundColor: ['#4361ee', '#7209b7', '#4cc9f0', '#f77f00'],
            borderColor: 'rgba(15,12,41,0.4)',
            borderWidth: 2
          }]
        },
        options: { plugins: { legend: { position: 'bottom' } }, cutout: '68%' }
      });
    }
  }

  /* ---------- Generic table renderer + CRUD ---------- */
  function renderTable(tbodyId, data, rowFn) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = data.map(rowFn).join('') ||
      `<tr><td colspan="6" style="text-align:center;color:var(--c-muted);padding:2rem;">No records yet. Click "Add" to create one.</td></tr>`;
  }

  function renderStudents() {
    renderTable('studentsTableBody', MockDB.get('students'), s => `
      <tr>
        <td><div class="avatar-cell"><img src="${s.photo}" alt=""><div><strong>${s.name}</strong><br><small style="color:var(--c-muted)">${s.roll}</small></div></div></td>
        <td>${s.dept}</td><td>${s.year}</td><td>${s.section}</td><td>${s.email}</td>
        <td class="row-actions">
          <button class="edit-btn" data-id="${s.id}" data-type="students" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="delete-btn" data-id="${s.id}" data-type="students" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`);
  }

  function renderTeachers() {
    renderTable('teachersTableBody', MockDB.get('teachers'), t => `
      <tr>
        <td><div class="avatar-cell"><img src="${t.photo}" alt=""><strong>${t.name}</strong></div></td>
        <td>${t.dept}</td><td>${t.subject}</td><td>${t.email}</td>
        <td class="row-actions">
          <button class="edit-btn" data-id="${t.id}" data-type="teachers" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="delete-btn" data-id="${t.id}" data-type="teachers" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`);
  }

  function renderDepartments() {
    renderTable('departmentsTableBody', MockDB.get('departments'), d => `
      <tr>
        <td><strong>${d.name}</strong></td><td>${d.code}</td><td>${d.hod}</td><td>${d.students}</td>
        <td class="row-actions">
          <button class="edit-btn" data-id="${d.id}" data-type="departments" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="delete-btn" data-id="${d.id}" data-type="departments" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`);
  }

  function renderSubjects() {
    renderTable('subjectsTableBody', MockDB.get('subjects'), s => `
      <tr>
        <td><strong>${s.name}</strong></td><td>${s.code}</td><td>${s.dept}</td><td>${s.year}</td>
        <td class="row-actions">
          <button class="edit-btn" data-id="${s.id}" data-type="subjects" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="delete-btn" data-id="${s.id}" data-type="subjects" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`);
  }

  renderStudents(); renderTeachers(); renderDepartments(); renderSubjects();

  const rendererByType = { students: renderStudents, teachers: renderTeachers, departments: renderDepartments, subjects: renderSubjects };

  /* ---------- Delete handler (event delegation) ---------- */
  document.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      const { id, type } = delBtn.dataset;
      if (confirm('Remove this record?')) {
        const list = MockDB.get(type).filter(item => item.id !== id);
        MockDB.set(type, list);
        rendererByType[type]();
      }
    }
  });

  /* ---------- Add modal (simple prompt-based demo add) ---------- */
  document.querySelectorAll('.add-record-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const name = prompt('Enter name:');
      if (!name) return;
      const list = MockDB.get(type);
      const id = type.slice(0, 2) + Date.now();
      let record;
      if (type === 'students') record = { id, name, roll: 'NEW' + Math.floor(Math.random()*1000), dept: 'CSE', year: '1st Year', section: 'A', email: name.toLowerCase().replace(/\s/g,'.') + '@college.edu', photo: 'https://i.pravatar.cc/100?u=' + id };
      if (type === 'teachers') record = { id, name, dept: 'CSE', subject: 'General', email: name.toLowerCase().replace(/\s/g,'.') + '@college.edu', photo: 'https://i.pravatar.cc/100?u=' + id };
      if (type === 'departments') record = { id, name, code: name.slice(0,3).toUpperCase(), hod: 'TBD', students: 0 };
      if (type === 'subjects') record = { id, name, code: 'NEW' + Math.floor(Math.random()*100), dept: 'CSE', year: '1st Year' };
      list.push(record);
      MockDB.set(type, list);
      rendererByType[type]();
    });
  });
});
