/* ============================================================
   EduTrack — Firebase Configuration
   ------------------------------------------------------------
   1. Create a project at https://console.firebase.google.com
   2. Enable: Authentication (Email/Password), Firestore Database, Storage
   3. Paste your project's config below (Project settings > General > Your apps)
   4. Set FIREBASE_ENABLED = true once your keys are in place.

   Until you connect a real project, EduTrack runs in "mock mode":
   it uses localStorage instead of Firebase so every screen is fully
   clickable and demo-able out of the box.
   ============================================================ */

const FIREBASE_ENABLED = false; // flip to true after adding your config below

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let auth = null;
let db = null;
let storage = null;

if (FIREBASE_ENABLED && window.firebase) {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
}

/* ---------- Mock backend (localStorage) ----------
   Mirrors the shape of Firestore collections so swapping in the
   real SDK later only means changing the functions below. */
const MockDB = {
  seedIfEmpty() {
    if (localStorage.getItem('et_seeded')) return;

    const students = [
      { id: 's1', name: 'Aditi Sharma', roll: 'CSE21001', dept: 'CSE', year: '2nd Year', section: 'A', email: 'aditi@college.edu', photo: 'https://i.pravatar.cc/100?img=47' },
      { id: 's2', name: 'Rohan Verma', roll: 'CSE21002', dept: 'CSE', year: '2nd Year', section: 'A', email: 'rohan@college.edu', photo: 'https://i.pravatar.cc/100?img=12' },
      { id: 's3', name: 'Meera Iyer', roll: 'CSE21003', dept: 'CSE', year: '2nd Year', section: 'A', email: 'meera@college.edu', photo: 'https://i.pravatar.cc/100?img=32' },
      { id: 's4', name: 'Karthik Raj', roll: 'CSE21004', dept: 'CSE', year: '2nd Year', section: 'A', email: 'karthik@college.edu', photo: 'https://i.pravatar.cc/100?img=51' },
      { id: 's5', name: 'Sneha Nair', roll: 'CSE21005', dept: 'CSE', year: '2nd Year', section: 'A', email: 'sneha@college.edu', photo: 'https://i.pravatar.cc/100?img=25' },
      { id: 's6', name: 'Arjun Das', roll: 'ECE21011', dept: 'ECE', year: '3rd Year', section: 'B', email: 'arjun@college.edu', photo: 'https://i.pravatar.cc/100?img=15' }
    ];
    const teachers = [
      { id: 't1', name: 'Dr. Priya Menon', dept: 'CSE', subject: 'Data Structures', email: 'priya.menon@college.edu', photo: 'https://i.pravatar.cc/100?img=48' },
      { id: 't2', name: 'Prof. Sanjay Gupta', dept: 'ECE', subject: 'Digital Electronics', email: 'sanjay.gupta@college.edu', photo: 'https://i.pravatar.cc/100?img=60' }
    ];
    const departments = [
      { id: 'd1', name: 'Computer Science', code: 'CSE', hod: 'Dr. Priya Menon', students: 240 },
      { id: 'd2', name: 'Electronics & Comm.', code: 'ECE', hod: 'Prof. Sanjay Gupta', students: 180 },
      { id: 'd3', name: 'Mechanical Engg.', code: 'MECH', hod: 'Dr. Vivek Rao', students: 150 }
    ];
    const subjects = [
      { id: 'sub1', name: 'Data Structures', code: 'CS201', dept: 'CSE', year: '2nd Year' },
      { id: 'sub2', name: 'Database Systems', code: 'CS202', dept: 'CSE', year: '2nd Year' },
      { id: 'sub3', name: 'Operating Systems', code: 'CS203', dept: 'CSE', year: '2nd Year' },
      { id: 'sub4', name: 'Digital Electronics', code: 'EC301', dept: 'ECE', year: '3rd Year' }
    ];

    // Generate 30 days of attendance history for each student x subject
    const attendance = [];
    const today = new Date();
    students.forEach(st => {
      subjects.filter(sub => sub.dept === st.dept).forEach(sub => {
        for (let i = 0; i < 30; i++) {
          const d = new Date(today); d.setDate(d.getDate() - i);
          if (d.getDay() === 0) continue; // skip Sundays
          const status = Math.random() > 0.14 ? 'present' : 'absent';
          attendance.push({ studentId: st.id, subjectId: sub.id, date: d.toISOString().slice(0,10), status });
        }
      });
    });

    localStorage.setItem('et_students', JSON.stringify(students));
    localStorage.setItem('et_teachers', JSON.stringify(teachers));
    localStorage.setItem('et_departments', JSON.stringify(departments));
    localStorage.setItem('et_subjects', JSON.stringify(subjects));
    localStorage.setItem('et_attendance', JSON.stringify(attendance));
    localStorage.setItem('et_seeded', 'true');
  },
  get(key) { return JSON.parse(localStorage.getItem('et_' + key) || '[]'); },
  set(key, value) { localStorage.setItem('et_' + key, JSON.stringify(value)); }
};

MockDB.seedIfEmpty();
