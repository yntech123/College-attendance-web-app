/* ============================================================
   EduTrack — profile.js
   Handles profile photo upload preview, profile info update,
   and password change form (mock or Firebase Auth).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const photoInput = document.getElementById('photoUploadInput');
  const photoPreview = document.getElementById('profilePhotoPreview');
  if (photoInput && photoPreview) {
    photoInput.addEventListener('change', () => {
      const file = photoInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => { photoPreview.src = e.target.result; };
      reader.readAsDataURL(file);
    });
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('profileMsg');
      msg.textContent = 'Profile updated successfully.';
      msg.className = 'form-msg success';
    });
  }

  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('passwordMsg');
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = document.getElementById('confirmPassword').value;
      if (newPass.length < 6) {
        msg.textContent = 'Password must be at least 6 characters.';
        msg.className = 'form-msg error';
        return;
      }
      if (newPass !== confirmPass) {
        msg.textContent = 'Passwords do not match.';
        msg.className = 'form-msg error';
        return;
      }
      if (FIREBASE_ENABLED && auth && auth.currentUser) {
        auth.currentUser.updatePassword(newPass)
          .then(() => { msg.textContent = 'Password changed successfully.'; msg.className = 'form-msg success'; passwordForm.reset(); })
          .catch(err => { msg.textContent = err.message; msg.className = 'form-msg error'; });
      } else {
        msg.textContent = 'Password changed successfully (demo mode).';
        msg.className = 'form-msg success';
        passwordForm.reset();
      }
    });
  }

  document.querySelectorAll('.toggle-pass').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      toggle.classList.toggle('fa-eye');
      toggle.classList.toggle('fa-eye-slash');
    });
  });
});
