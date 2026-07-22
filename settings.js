/* ============================================================
   EduTrack — settings.js
   Theme switch (shared key with dashboard-common.js), notification
   preference toggles, and language selection — all persisted
   to localStorage.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const settingsForm = document.getElementById('settingsPanel');
  if (!settingsForm) return;

  const prefs = JSON.parse(localStorage.getItem('et_prefs') || '{}');
  const defaults = { emailNotif: true, pushNotif: true, weeklyDigest: false, language: 'en' };
  const merged = { ...defaults, ...prefs };

  document.querySelectorAll('[data-pref]').forEach(input => {
    const key = input.dataset.pref;
    if (input.type === 'checkbox') input.checked = merged[key];
    else input.value = merged[key];

    input.addEventListener('change', () => {
      const current = JSON.parse(localStorage.getItem('et_prefs') || '{}');
      current[key] = input.type === 'checkbox' ? input.checked : input.value;
      localStorage.setItem('et_prefs', JSON.stringify(current));

      const banner = document.getElementById('settingsSavedMsg');
      if (banner) {
        banner.textContent = 'Preferences saved.';
        banner.classList.add('success');
        clearTimeout(window._settingsMsgTimeout);
        window._settingsMsgTimeout = setTimeout(() => { banner.textContent = ''; }, 2200);
      }
    });
  });
});
