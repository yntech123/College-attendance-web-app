/* ============================================================
   EduTrack — dashboard-common.js
   Shared across all dashboard pages: sidebar toggle (mobile),
   theme toggle, notification dropdown, session guard, logout.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Page loader ---------- */
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 700);
  }

  /* ---------- Session guard + user chip ---------- */
  const session = JSON.parse(localStorage.getItem('et_session') || 'null');
  const userNameEls = document.querySelectorAll('.current-user-name');
  const userRoleEls = document.querySelectorAll('.current-user-role');
  if (session) {
    userNameEls.forEach(el => el.textContent = toTitleCase(session.name || session.email));
    userRoleEls.forEach(el => el.textContent = session.role.charAt(0).toUpperCase() + session.role.slice(1));
  }
  function toTitleCase(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }

  /* ---------- Logout ---------- */
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.removeItem('et_session');
      window.location.href = 'login.html';
    });
  });

  /* ---------- Mobile sidebar toggle ---------- */
  const sidebar = document.querySelector('.sidebar');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const overlay = document.querySelector('.sidebar-overlay');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.style.display = 'none';
    });
  }

  /* ---------- Theme toggle (persisted, supports multiple toggles per page) ---------- */
  const themeToggles = document.querySelectorAll('.theme-toggle');
  const savedTheme = localStorage.getItem('et_theme');
  if (savedTheme === 'light') document.body.classList.add('light-mode');
  themeToggles.forEach(toggle => {
    toggle.checked = document.body.classList.contains('light-mode');
    toggle.addEventListener('change', () => {
      document.body.classList.toggle('light-mode', toggle.checked);
      localStorage.setItem('et_theme', toggle.checked ? 'light' : 'dark');
      themeToggles.forEach(t => { if (t !== toggle) t.checked = toggle.checked; });
    });
  });

  /* ---------- Notification dropdown ---------- */
  const notifBtn = document.querySelector('.notif-btn');
  const notifPanel = document.querySelector('.notif-panel');
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!notifPanel.contains(e.target)) notifPanel.classList.remove('open');
    });
  }

  /* ---------- Scroll reveal (dashboards use it for card entrance) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }
});
