# EduTrack — College Attendance Management System

A full front-end (HTML/CSS/JS) attendance platform with a glassmorphism UI,
built to run instantly in **demo mode** (localStorage) and designed to be
wired up to **Firebase** in a few steps.

## Run it
Just open `index.html` in a browser — no build step, no server required.
(Some browsers restrict `fetch`/modules from `file://`; if fonts/icons don't
load, serve the folder locally instead, e.g. `python3 -m http.server`.)

## Pages
- `index.html` — Landing page
- `login.html` — Student / Teacher / Admin sign-in (tabs)
- `admin-dashboard.html` — KPIs, charts, Student/Teacher/Department/Subject CRUD
- `teacher-dashboard.html` — Class selection, roll call, save attendance, history
- `student-dashboard.html` — Attendance ring, subject breakdown, calendar, trend chart
- `reports.html` — Filterable report table, CSV (Excel) and PDF export
- `profile.html` — Edit profile, upload photo, change password
- `settings.html` — Theme, notification and language preferences

## Demo mode (default)
`js/firebase-config.js` seeds realistic sample data (students, teachers,
departments, subjects, 30 days of attendance) into `localStorage` the first
time you open the site. Every screen — login, CRUD, roll call, reports,
exports — is fully functional against that mock data. On the login page,
**any email + password combination signs you in.**

## Connecting real Firebase
1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Email/Password**, **Firestore**, and **Storage**
3. Copy your web app config into `js/firebase-config.js`:
   ```js
   const FIREBASE_ENABLED = true;
   const firebaseConfig = { apiKey: "...", authDomain: "...", ... };
   ```
4. Add the Firebase SDK script tags to any page that needs them (already
   included on `login.html`; add to others as you migrate each page off
   the mock `MockDB` helper).
5. Replace `MockDB.get(...)` / `MockDB.set(...)` calls in `js/admin.js`,
   `js/teacher.js`, `js/student.js`, and `js/reports.js` with the matching
   Firestore calls (`db.collection('students').get()`, etc.) — the data
   shapes already match typical Firestore documents, so this is a drop-in
   swap rather than a redesign.

## Tech
- Google Fonts: Poppins (display) + Inter (body)
- Font Awesome 6 (icons)
- Chart.js (analytics)
- jsPDF (PDF export)
- No frameworks — vanilla HTML/CSS/JS throughout, split into clearly
  commented, single-purpose files.
