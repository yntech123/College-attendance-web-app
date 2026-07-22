/* ============================================================
   EduTrack — auth.js
   Handles the login page: role tabs, password visibility toggle,
   remember me, forgot-password flow, and sign-in (mock or Firebase).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Role tabs ---------- */
  const tabs = document.querySelectorAll('.auth-tab');
  const panels = document.querySelectorAll('.auth-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  /* ---------- Password visibility toggle ---------- */
  document.querySelectorAll('.toggle-pass').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      toggle.classList.toggle('fa-eye');
      toggle.classList.toggle('fa-eye-slash');
    });
  });

  /* ---------- Prefill remembered email ---------- */
  document.querySelectorAll('form[data-role]').forEach(form => {
    const role = form.dataset.role;
    const remembered = localStorage.getItem('et_remember_' + role);
    if (remembered) {
      const emailField = form.querySelector('input[type="email"]');
      const rememberBox = form.querySelector('.remember-check');
      if (emailField) emailField.value = remembered;
      if (rememberBox) rememberBox.checked = true;
    }
  });

  /* ---------- Handle login submit ---------- */
  document.querySelectorAll('form[data-role]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = form.dataset.role;
      const email = form.querySelector('input[type="email"]').value.trim();
      const password = form.querySelector('input[type="password"], input[type="text"].pass-field').value;
      const rememberBox = form.querySelector('.remember-check');
      const msg = form.querySelector('.form-msg');
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!email || !password) {
        msg.textContent = 'Please fill in both email and password.';
        msg.className = 'form-msg error';
        return;
      }

      submitBtn.disabled = true;
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';

      // Remember me
      if (rememberBox && rememberBox.checked) {
        localStorage.setItem('et_remember_' + role, email);
      } else {
        localStorage.removeItem('et_remember_' + role);
      }

      const proceed = () => {
        localStorage.setItem('et_session', JSON.stringify({
          role, email, name: email.split('@')[0].replace(/\./g, ' '),
          loginAt: Date.now()
        }));
        msg.textContent = 'Login successful! Redirecting...';
        msg.className = 'form-msg success';
        const dest = { admin: 'admin-dashboard.html', teacher: 'teacher-dashboard.html', student: 'student-dashboard.html' }[role];
        setTimeout(() => { window.location.href = dest; }, 700);
      };

      if (FIREBASE_ENABLED && auth) {
        auth.signInWithEmailAndPassword(email, password)
          .then(proceed)
          .catch(err => {
            msg.textContent = err.message;
            msg.className = 'form-msg error';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
          });
      } else {
        // Mock mode: any non-empty credentials succeed after a short delay
        setTimeout(proceed, 900);
      }
    });
  });

  /* ---------- Forgot password ---------- */
  document.querySelectorAll('.forgot-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const form = link.closest('form');
      const emailField = form.querySelector('input[type="email"]');
      const msg = form.querySelector('.form-msg');
      const email = emailField.value.trim();
      if (!email) {
        msg.textContent = 'Enter your email above first, then click "Forgot password?"';
        msg.className = 'form-msg error';
        return;
      }
      if (FIREBASE_ENABLED && auth) {
        auth.sendPasswordResetEmail(email)
          .then(() => { msg.textContent = 'Password reset link sent to ' + email; msg.className = 'form-msg success'; })
          .catch(err => { msg.textContent = err.message; msg.className = 'form-msg error'; });
      } else {
        msg.textContent = 'Password reset link sent to ' + email + ' (demo mode).';
        msg.className = 'form-msg success';
      }
    });
  });
});
