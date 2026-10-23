/* Student portal - one script for every page inside /student.
   The page is chosen by <body data-page="..."> and the title by data-title.
   Data is shared with the other modules through localStorage:
     campuscore_courses_v1   course catalog (courses/ module)
     sis_admin_enrollments   enrollment requests (admin approves / rejects them)
     sis_admin_academics     grades + attendance (admin records)
     sis_admin_announcements announcements (admin publishes them)
     sis_student_profiles    extra profile details saved by the student */
(() => {
'use strict';

const PAGE = document.body.dataset.page;
const TITLE = document.body.dataset.title || 'Student';

/* ---------- small helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
const pill = (text, cls) => `<span class="status ${cls || String(text).toLowerCase()}">${esc(text)}</span>`;
const read = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; } catch (e) { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; } };

/* ---------- only logged-in students may use these pages ---------- */
let user = null;
try { user = JSON.parse(sessionStorage.getItem('sis_user')); } catch (e) {}
if (!user || user.role !== 'student') {
  location.replace(user ? ({ admin: '../admin/index.html', teacher: '../teacher/html/dashboard.html' })[user.role] : '../auth/login.html');
  return;
}

/* ---------- shared data (same keys the admin + courses modules use) ---------- */
const K_COURSES = 'campuscore_courses_v1', K_ENROLL = 'sis_admin_enrollments', K_ACAD = 'sis_admin_academics',
      K_ANN = 'sis_admin_announcements', K_PROFILES = 'sis_student_profiles';
const MAX_CREDITS = 18, MIN_ATTENDANCE = 75;
const DEPTS = ['Computer Science', 'Artificial Intelligence', 'Information Technology', 'Computer Engineering', 'Electrical Engineering', 'Mechatronics', 'Communications'];

/* fallbacks, used only until the other modules save their own data */
const STARTER_COURSES = [
  { id: 'c1', code: 'CSC101', name: 'Introduction to Computer Science', department: 'Computer Science', instructor: 'Dr. Ahmed Hassan', credits: 3, semester: 'Fall 2026', prerequisite: 'None', status: 'Active' },
  { id: 'c2', code: 'CSC220', name: 'Computer Organization', department: 'Computer Science', instructor: 'Dr. Mariam Ali', credits: 3, semester: 'Fall 2026', prerequisite: 'CSC120', status: 'Active' },
  { id: 'c3', code: 'AI201', name: 'Introduction to Artificial Intelligence', department: 'Artificial Intelligence', instructor: 'Dr. Omar Khaled', credits: 3, semester: 'Fall 2026', prerequisite: 'CSC101', status: 'Active' },
  { id: 'c4', code: 'IT210', name: 'Database Management Systems', department: 'Information Technology', instructor: 'Dr. Salma Nabil', credits: 4, semester: 'Spring 2027', prerequisite: 'None', status: 'Inactive' }
];
const SEED_ENROLL = [
  { id: 'EN-5001', student: 'Mariam Adel', course: 'Data Structures', date: '2026-10-12', status: 'Pending' },
  { id: 'EN-5002', student: 'Omar Hassan', course: 'Control Systems', date: '2026-10-13', status: 'Approved' },
  { id: 'EN-5003', student: 'Salma Tarek', course: 'Data Structures', date: '2026-10-15', status: 'Pending' }
];
const SEED_ACAD = [
  { id: 'AC-01', student: 'Mariam Adel', course: 'Data Structures', grade: 'A-', attendance: 92, status: 'Present' },
  { id: 'AC-02', student: 'Omar Hassan', course: 'Control Systems', grade: 'B+', attendance: 86, status: 'Present' },
  { id: 'AC-03', student: 'Nour Ahmed', course: 'Circuit Design', grade: 'A', attendance: 78, status: 'Absent' },
  { id: 'AC-04', student: 'Salma Tarek', course: 'Data Structures', grade: 'B', attendance: 95, status: 'Present' }
];
const SEED_ANN = [
  { id: 'ANN-01', title: 'Midterm examination schedule', body: 'The midterm examination schedule will be published on the student portal. Please check course announcements regularly.', audience: 'All students', date: '2026-10-10', status: 'Published' },
  { id: 'ANN-02', title: 'Course registration reminder', body: 'Students should review their course selections and prerequisites before the registration deadline.', audience: 'All students', date: '2026-10-15', status: 'Published' }
];
const POINTS = { 'A+': 4, 'A': 4, 'A-': 3.7, 'B+': 3.3, 'B': 3, 'B-': 2.7, 'C+': 2.3, 'C': 2, 'C-': 1.7, 'D+': 1.3, 'D': 1, 'F': 0 };

const catalog = () => read(K_COURSES, STARTER_COURSES);
const allEnrollments = () => read(K_ENROLL, SEED_ENROLL);
const myEnrollments = () => allEnrollments().filter(e => same(e.student, user.name));
const myRecords = () => read(K_ACAD, SEED_ACAD).filter(a => same(a.student, user.name));
const courseByName = name => catalog().find(c => same(c.name, name));
const courseByCode = code => catalog().find(c => same(c.code, code));
const nextEnrollmentId = list => 'EN-' + (list.reduce((m, x) => Math.max(m, Number((String(x.id).match(/\d+/) || [0])[0])), 0) + 1);

/* profile: name + email come from the login, the rest is saved here */
function getProfile() {
  const all = read(K_PROFILES, {});
  const key = String(user.email).toLowerCase();
  if (!all[key]) {
    all[key] = { id: 'S-' + (3001 + Object.keys(all).length), phone: '', dob: '', gender: '', department: '', year: '', address: '' };
    write(K_PROFILES, all);
  }
  return all[key];
}
function saveProfile(p) {
  const all = read(K_PROFILES, {});
  all[String(user.email).toLowerCase()] = p;
  return write(K_PROFILES, all);
}

/* one row per approved course, joined with catalog + grade + attendance */
function courseRows() {
  const records = myRecords();
  return myEnrollments().filter(e => e.status === 'Approved').map(e => {
    const c = courseByName(e.course);
    const r = records.find(x => same(x.course, e.course));
    return {
      name: e.course, code: c ? c.code : '—', credits: c ? Number(c.credits) || 3 : 3,
      instructor: c ? c.instructor : '—', semester: c ? c.semester : '—', department: c ? c.department : '—',
      grade: r ? r.grade : '', attendance: r && r.attendance !== '' ? Number(r.attendance) : null, attStatus: r ? r.status : ''
    };
  });
}
function gpaOf(rows) {
  const graded = rows.filter(r => POINTS[r.grade] !== undefined);
  const credits = graded.reduce((n, r) => n + r.credits, 0);
  if (!credits) return null;
  return graded.reduce((n, r) => n + POINTS[r.grade] * r.credits, 0) / credits;
}
function avgAttendance(rows) {
  const list = rows.filter(r => r.attendance !== null);
  return list.length ? Math.round(list.reduce((n, r) => n + r.attendance, 0) / list.length) : null;
}
function myAnnouncements() {
  const dept = getProfile().department;
  return read(K_ANN, SEED_ANN)
    .filter(a => a.status === 'Published' && (['All students', 'Students and teachers'].includes(a.audience) || (dept && same(a.audience, dept))))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/* ---------- toast + confirm box ---------- */
let tt;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2800); }
function confirmBox(title, msg, label, danger, onOk) {
  const m = document.createElement('div'); m.className = 'modal-backdrop';
  m.innerHTML = `<div class="modal" style="width:min(420px,100%)"><div class="modal-head"><h2>${esc(title)}</h2><button class="modal-close" data-x>×</button></div>
   <p class="muted" style="line-height:1.6">${msg}</p>
   <div class="modal-actions"><button class="btn btn-secondary" data-x>Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${esc(label)}</button></div></div>`;
  m.onclick = e => { if (e.target === m || e.target.hasAttribute('data-x')) m.remove(); if (e.target.hasAttribute('data-ok')) { m.remove(); onOk(); } };
  document.body.appendChild(m);
}

/* ---------- layout shell (sidebar + topbar + footer) ---------- */
const NAV = [
  ['dashboard', '🏠', 'Dashboard'], ['my-courses', '📚', 'My Courses'], ['course-registration', '📝', 'Course Registration'],
  ['my-grades', '🏅', 'My Grades'], ['my-attendance', '✅', 'My Attendance'], ['transcript', '📄', 'Transcript'],
  ['announcements', '📢', 'Announcements'], ['profile', '👤', 'My Profile']
];
function shell() {
  const content = $('#content');
  const nav = NAV.map(n => `<a class="nav-item ${n[0] === PAGE ? 'active' : ''}" href="${n[0]}.html"><span>${n[1]}</span>${n[2]}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="app-shell"><aside class="sidebar" id="sidebar">
   <div class="brand"><div class="brand-mark">S</div><div><strong>SIS</strong><small>Student Portal</small></div></div>
   <div class="nav-label">MENU</div><nav>${nav}</nav>
   <div class="sidebar-bottom"><div class="admin-avatar">${esc(initials(user.name))}</div>
    <div class="admin-details"><strong>${esc(user.name)}</strong><small>Student</small></div>
    <a class="icon-button" href="../auth/login.html" id="logoutLink" title="Log out">↪</a></div></aside>
  <div class="main-area"><header class="topbar"><div class="topbar-left">
   <button class="mobile-menu" id="menuBtn" type="button" aria-label="Menu">☰</button>
   <div><div class="eyebrow">STUDENT PORTAL</div><h1>${esc(TITLE)}</h1></div></div>
   <div class="topbar-right"><span class="today">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><div class="top-avatar">${esc(initials(user.name))}</div></div></header>
   <div class="page-content" id="pc"></div>
   <footer>Student Information System<span>·</span>Student portal<span class="footer-right">© 2026</span></footer></div></div>
  <div class="toast" id="toast"></div>`);
  $('#pc').appendChild(content);
  $('#menuBtn').onclick = () => $('#sidebar').classList.toggle('open');
  $('#logoutLink').onclick = () => sessionStorage.removeItem('sis_user');
}

const empty = (title, text, link) => `<div class="empty-state"><strong>${esc(title)}</strong>${esc(text)}${link ? `<div style="margin-top:12px"><a class="btn btn-primary" href="${link[0]}">${esc(link[1])}</a></div>` : ''}</div>`;
const statCard = (label, icon, value, foot) => `<div class="stat-card"><div class="stat-top">${label} <span class="stat-icon">${icon}</span></div><div class="stat-number">${value}</div><div class="stat-foot">${foot}</div></div>`;
const fmtGpa = g => g === null ? '—' : g.toFixed(2);

/* ================= PAGES ================= */

function dashboard() {
  const rows = courseRows(), mine = myEnrollments();
  const pending = mine.filter(e => e.status === 'Pending').length;
  const gpa = gpaOf(rows), att = avgAttendance(rows), news = myAnnouncements().slice(0, 3);
  $('#content').innerHTML = `
   <div class="welcome-row"><div><h2>Welcome, ${esc(user.name)} 👋</h2><p>Here is a summary of your semester.</p></div>
    <a class="btn btn-primary" href="course-registration.html">＋ Register for a course</a></div>
   <div class="stats-grid">
    ${statCard('Enrolled courses', '📚', rows.length, rows.reduce((n, r) => n + r.credits, 0) + ' credit hours')}
    ${statCard('GPA', '🏅', fmtGpa(gpa), gpa === null ? 'No grades yet' : 'Cumulative')}
    ${statCard('Attendance', '✅', att === null ? '—' : att + '%', att === null ? 'No records yet' : 'Average across courses')}
    ${statCard('Pending requests', '⏳', pending, pending ? 'Waiting for admin approval' : 'Nothing pending')}
   </div>
   <div class="dashboard-grid">
    <div class="panel"><div class="panel-header"><div><h3>My courses</h3><p>Courses you are enrolled in</p></div><a class="link-button" href="my-courses.html">View all →</a></div>
     ${rows.length ? `<div class="table-wrap"><table><thead><tr><th>Course</th><th>Instructor</th><th>Credits</th><th>Grade</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td><strong>${esc(r.code)}</strong> · ${esc(r.name)}</td><td>${esc(r.instructor)}</td><td>${r.credits}</td><td><span class="grade-pill">${esc(r.grade || '—')}</span></td></tr>`).join('')}</tbody></table></div>`
       : empty('No enrolled courses yet', 'Send a registration request and wait for approval.', ['course-registration.html', 'Browse courses'])}
    </div>
    <div class="panel"><div class="panel-header"><div><h3>Quick actions</h3><p>Common tasks</p></div></div>
     <div class="quick-grid">
      <a class="quick-action" href="course-registration.html"><span class="qa-icon">📝</span><strong>Register</strong><small>Request a course</small></a>
      <a class="quick-action" href="my-grades.html"><span class="qa-icon">🏅</span><strong>Grades</strong><small>See your results</small></a>
      <a class="quick-action" href="my-attendance.html"><span class="qa-icon">✅</span><strong>Attendance</strong><small>Check your records</small></a>
      <a class="quick-action" href="transcript.html"><span class="qa-icon">📄</span><strong>Transcript</strong><small>View / print</small></a>
     </div></div>
   </div>
   <div class="panel" style="margin-top:18px"><div class="panel-header"><div><h3>Latest announcements</h3><p>News from the administration</p></div><a class="link-button" href="announcements.html">View all →</a></div>
    ${news.length ? news.map(a => `<div class="announcement-card"><h4>${esc(a.title)}</h4><p>${esc(a.body)}</p><div class="announcement-meta"><span>${esc(a.audience)}</span><span>${esc(a.date)}</span></div></div>`).join('') : '<p class="muted">No announcements right now.</p>'}
   </div>`;
}

function myCourses() {
  const rows = courseRows();
  const requests = myEnrollments().filter(e => e.status !== 'Approved');
  $('#content').innerHTML = `
   <div class="stats-grid">
    ${statCard('Enrolled courses', '📚', rows.length, 'Approved by admin')}
    ${statCard('Credit hours', '🎓', rows.reduce((n, r) => n + r.credits, 0), 'Limit is ' + MAX_CREDITS)}
    ${statCard('Pending', '⏳', requests.filter(e => e.status === 'Pending').length, 'Waiting for approval')}
    ${statCard('Rejected', '✖', requests.filter(e => e.status === 'Rejected').length, 'You can request again')}
   </div>
   <div class="panel"><div class="table-heading"><h3>Enrolled courses</h3><small>${rows.length} course(s)</small></div>
    ${rows.length ? `<div class="table-wrap"><table><thead><tr><th>Code</th><th>Course</th><th>Department</th><th>Instructor</th><th>Credits</th><th>Semester</th></tr></thead><tbody>
     ${rows.map(r => `<tr><td><strong>${esc(r.code)}</strong></td><td>${esc(r.name)}</td><td>${esc(r.department)}</td><td>${esc(r.instructor)}</td><td>${r.credits}</td><td>${esc(r.semester)}</td></tr>`).join('')}</tbody></table></div>`
      : empty('No enrolled courses', 'Your approved courses will appear here.', ['course-registration.html', 'Register for a course'])}
   </div>
   <div class="panel" style="margin-top:18px"><div class="table-heading"><h3>Registration requests</h3><small>${requests.length} request(s)</small></div>
    ${requests.length ? `<div class="table-wrap"><table><thead><tr><th>Request</th><th>Course</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>
     ${requests.map(e => `<tr><td><strong>${esc(e.id)}</strong></td><td>${esc(e.course)}</td><td>${esc(e.date)}</td><td>${pill(e.status)}</td>
      <td>${e.status === 'Pending' ? `<button class="action-btn delete" data-cancel="${esc(e.id)}">Cancel request</button>` : '<span class="muted">—</span>'}</td></tr>`).join('')}</tbody></table></div>`
      : '<p class="muted">You have no open requests.</p>'}
   </div>`;
  $('#content').onclick = e => {
    const b = e.target.closest('[data-cancel]'); if (!b) return;
    confirmBox('Cancel request', 'Do you want to cancel this registration request?', 'Cancel request', true, () => {
      write(K_ENROLL, allEnrollments().filter(x => x.id !== b.dataset.cancel));
      toast('Request cancelled.'); myCourses();
    });
  };
}

function registration() {
  let q = '', dept = '';
  const active = () => catalog().filter(c => c.status === 'Active');
  const depts = [...new Set(active().map(c => c.department))];
  $('#content').innerHTML = `
   <div class="panel"><div class="panel-header"><div><h3>Available courses</h3><p>Send a request. The admin approves it before you are enrolled.</p></div><span class="muted" id="creditInfo"></span></div>
    <div class="toolbar"><div class="search-box"><span>🔍</span><input id="q" placeholder="Search code, course or instructor…"></div>
     <select id="dept"><option value="">All departments</option>${depts.map(d => `<option>${esc(d)}</option>`).join('')}</select></div>
    <div class="course-grid" id="grid"></div></div>`;

  const latest = course => myEnrollments().filter(e => same(e.course, course.name)).pop();
  const usedCredits = () => myEnrollments().filter(e => e.status === 'Approved' || e.status === 'Pending')
    .reduce((n, e) => { const c = courseByName(e.course); return n + (c ? Number(c.credits) || 3 : 3); }, 0);

  function problem(course) {   // returns a message when the student cannot register, else ''
    const pre = String(course.prerequisite || '').trim();
    if (pre && !/^none$/i.test(pre)) {
      const preCourse = courseByCode(pre);   // a prerequisite that is not in the catalog is ignored
      if (preCourse && !myEnrollments().some(e => e.status === 'Approved' && same(e.course, preCourse.name))) return 'You must complete ' + pre + ' first.';
    }
    if (usedCredits() + (Number(course.credits) || 3) > MAX_CREDITS) return 'This would go over the ' + MAX_CREDITS + ' credit-hour limit.';
    return '';
  }

  function draw() {
    const t = q.toLowerCase();
    const list = active().filter(c => (!t || [c.code, c.name, c.instructor].some(v => String(v).toLowerCase().includes(t))) && (!dept || c.department === dept));
    $('#creditInfo').textContent = 'Credits used: ' + usedCredits() + ' / ' + MAX_CREDITS;
    $('#grid').innerHTML = list.map(c => {
      const e = latest(c), st = e ? e.status : '';
      const action = st === 'Approved' ? pill('Enrolled', 'approved') : st === 'Pending' ? pill('Pending', 'pending')
        : `<button class="btn btn-primary btn-small" data-reg="${esc(c.id)}">${st === 'Rejected' ? 'Request again' : 'Register'}</button>`;
      return `<div class="course-card"><div class="course-top"><strong>${esc(c.code)}</strong><span class="muted">${Number(c.credits) || 3} credits</span></div>
        <h4>${esc(c.name)}</h4><p class="muted">${esc(c.instructor)} · ${esc(c.department)}</p>
        <p class="muted">${esc(c.semester)} · Prerequisite: ${esc(c.prerequisite || 'None')}</p>
        <div class="course-foot">${st === 'Rejected' ? pill('Rejected') : ''}${action}</div></div>`;
    }).join('') || empty('No courses found', 'Try a different search or department.');
  }
  $('#q').oninput = e => { q = e.target.value.trim(); draw(); };
  $('#dept').onchange = e => { dept = e.target.value; draw(); };
  $('#grid').onclick = e => {
    const b = e.target.closest('[data-reg]'); if (!b) return;
    const course = active().find(c => c.id === b.dataset.reg); if (!course) return;
    const msg = problem(course); if (msg) return toast(msg);
    confirmBox('Register for course', `Send a registration request for <b>${esc(course.code)} · ${esc(course.name)}</b>?`, 'Send request', false, () => {
      const list = allEnrollments().filter(x => !(same(x.student, user.name) && same(x.course, course.name) && x.status === 'Rejected'));
      list.push({ id: nextEnrollmentId(list), student: user.name, course: course.name, code: course.code, date: new Date().toISOString().slice(0, 10), status: 'Pending' });
      if (write(K_ENROLL, list)) toast('Request sent. Waiting for admin approval.'); else toast('Database error: could not save the request.');
      draw();
    });
  };
  draw();
}

function myGrades() {
  const rows = courseRows(), gpa = gpaOf(rows), graded = rows.filter(r => POINTS[r.grade] !== undefined);
  $('#content').innerHTML = `
   <div class="stats-grid">
    ${statCard('GPA', '🏅', fmtGpa(gpa), 'Cumulative')}
    ${statCard('Graded courses', '📝', graded.length, 'Out of ' + rows.length)}
    ${statCard('Credits earned', '🎓', graded.filter(r => POINTS[r.grade] > 0).reduce((n, r) => n + r.credits, 0), 'Passed courses')}
    ${statCard('Best grade', '⭐', graded.length ? graded.slice().sort((a, b) => POINTS[b.grade] - POINTS[a.grade])[0].grade : '—', 'Highest result')}
   </div>
   <div class="panel"><div class="table-heading"><h3>Course grades</h3><small>${rows.length} course(s)</small></div>
    ${rows.length ? `<div class="table-wrap"><table><thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Grade</th><th>Points</th><th>Status</th></tr></thead><tbody>
     ${rows.map(r => { const p = POINTS[r.grade]; return `<tr><td><strong>${esc(r.code)}</strong></td><td>${esc(r.name)}</td><td>${r.credits}</td>
      <td><span class="grade-pill">${esc(r.grade || '—')}</span></td><td>${p === undefined ? '—' : p.toFixed(1)}</td><td>${p === undefined ? pill('Not graded', 'pending') : p > 0 ? pill('Passed', 'approved') : pill('Failed', 'rejected')}</td></tr>`; }).join('')}</tbody></table></div>`
      : empty('No grades yet', 'Grades appear after you are enrolled in a course.', ['course-registration.html', 'Register for a course'])}
   </div>`;
}

function myAttendance() {
  const rows = courseRows(), avg = avgAttendance(rows), risk = rows.filter(r => r.attendance !== null && r.attendance < MIN_ATTENDANCE);
  $('#content').innerHTML = `
   <div class="stats-grid">
    ${statCard('Average attendance', '✅', avg === null ? '—' : avg + '%', 'All courses')}
    ${statCard('Courses tracked', '📚', rows.filter(r => r.attendance !== null).length, 'Out of ' + rows.length)}
    ${statCard('At risk', '⚠️', risk.length, 'Below ' + MIN_ATTENDANCE + '%')}
    ${statCard('Minimum required', '📏', MIN_ATTENDANCE + '%', 'To sit the final exam')}
   </div>
   ${risk.length ? `<div class="notice">⚠️ Your attendance is below ${MIN_ATTENDANCE}% in: <b>${risk.map(r => esc(r.name)).join(', ')}</b>.</div>` : ''}
   <div class="panel"><div class="table-heading"><h3>Attendance by course</h3><small>${rows.length} course(s)</small></div>
    ${rows.length ? `<div class="table-wrap"><table><thead><tr><th>Course</th><th>Attendance</th><th style="width:30%">Progress</th><th>Last session</th></tr></thead><tbody>
     ${rows.map(r => `<tr><td><strong>${esc(r.code)}</strong> · ${esc(r.name)}</td><td>${r.attendance === null ? '—' : r.attendance + '%'}</td>
      <td>${r.attendance === null ? '<span class="muted">No records</span>' : `<div class="bar-track"><div class="bar-fill ${r.attendance < MIN_ATTENDANCE ? 'low' : ''}" style="width:${Math.min(100, r.attendance)}%"></div></div>`}</td>
      <td>${r.attStatus ? pill(r.attStatus) : '<span class="muted">—</span>'}</td></tr>`).join('')}</tbody></table></div>`
      : empty('No attendance records', 'Attendance appears after you are enrolled in a course.', ['course-registration.html', 'Register for a course'])}
   </div>`;
}

function transcript() {
  const rows = courseRows().filter(r => POINTS[r.grade] !== undefined), gpa = gpaOf(rows), p = getProfile();
  $('#content').innerHTML = `
   <div class="panel transcript">
    <div class="profile-head"><div><h2>Academic Transcript</h2><p class="muted">Student Information System · generated ${new Date().toLocaleDateString()}</p></div>
     <button class="btn btn-secondary noprint" id="printBtn" type="button">🖨 Print</button></div>
    <div class="info-grid">
     <div class="info-item"><span>Name</span><strong>${esc(user.name)}</strong></div>
     <div class="info-item"><span>Student ID</span><strong>${esc(p.id)}</strong></div>
     <div class="info-item"><span>Email</span><strong>${esc(user.email)}</strong></div>
     <div class="info-item"><span>Department</span><strong>${esc(p.department || '—')}</strong></div>
     <div class="info-item"><span>Year</span><strong>${esc(p.year ? 'Year ' + p.year : '—')}</strong></div>
     <div class="info-item"><span>Cumulative GPA</span><strong>${fmtGpa(gpa)}</strong></div>
    </div>
    <div class="table-heading" style="margin-top:22px"><h3>Graded courses</h3><small>${rows.length} course(s) · ${rows.reduce((n, r) => n + r.credits, 0)} credit hours</small></div>
    ${rows.length ? `<div class="table-wrap"><table><thead><tr><th>Code</th><th>Course</th><th>Semester</th><th>Credits</th><th>Grade</th><th>Points</th></tr></thead><tbody>
     ${rows.map(r => `<tr><td><strong>${esc(r.code)}</strong></td><td>${esc(r.name)}</td><td>${esc(r.semester)}</td><td>${r.credits}</td><td><span class="grade-pill">${esc(r.grade)}</span></td><td>${POINTS[r.grade].toFixed(1)}</td></tr>`).join('')}</tbody></table></div>`
      : empty('Nothing to show yet', 'Your transcript lists courses after they are graded.')}
   </div>`;
  const b = $('#printBtn'); if (b) b.onclick = () => window.print();
}

function announcements() {
  const list = myAnnouncements();
  $('#content').innerHTML = `<div class="panel"><div class="panel-header"><div><h3>Announcements</h3><p>Messages for students${getProfile().department ? ' and for ' + esc(getProfile().department) : ''}</p></div></div>
   ${list.length ? list.map(a => `<div class="announcement-card"><h4>${esc(a.title)}</h4><p>${esc(a.body)}</p><div class="announcement-meta"><span>${esc(a.audience)}</span><span>${esc(a.date)}</span></div></div>`).join('') : empty('No announcements', 'Check again later.')}</div>`;
}

function profile() {
  const p = getProfile(), rows = courseRows();
  const opt = (list, val) => list.map(v => `<option ${String(v) === String(val) ? 'selected' : ''}>${esc(v)}</option>`).join('');
  $('#content').innerHTML = `
   <div class="profile-head"><div class="person"><div class="mini-avatar" style="width:54px;height:54px;font-size:16px;border-radius:14px">${esc(initials(user.name))}</div>
    <div><h2>${esc(user.name)}</h2><span class="muted">${esc(p.id)} · ${esc(user.email)}</span></div></div></div>
   <div class="dashboard-grid">
   <div class="panel"><div class="panel-header"><div><h3>Personal details</h3><p>Your name and email come from your account and cannot be changed here.</p></div></div>
    <form id="pf" novalidate><div class="form-grid">
     <label>Full name<input value="${esc(user.name)}" readonly></label>
     <label>Email<input value="${esc(user.email)}" readonly></label>
     <label>Phone<input id="phone" value="${esc(p.phone)}" placeholder="01012345678"><span class="field-error" id="phoneErr"></span></label>
     <label>Date of birth<input id="dob" type="date" value="${esc(p.dob)}"><span class="field-error" id="dobErr"></span></label>
     <label>Gender<select id="gender"><option value="">Select…</option>${opt(['Female', 'Male'], p.gender)}</select></label>
     <label>Department<select id="department"><option value="">Select…</option>${opt(DEPTS, p.department)}</select></label>
     <label>Year<select id="year"><option value="">Select…</option>${opt([1, 2, 3, 4, 5], p.year)}</select></label>
     <label class="full">Address<input id="address" value="${esc(p.address)}" placeholder="City, country"></label>
    </div><div class="form-actions"><button class="btn btn-primary" type="submit">Save changes</button></div></form></div>
   <div class="panel"><div class="panel-header"><div><h3>Academic summary</h3></div></div>
    <div class="info-grid one">
     <div class="info-item"><span>Enrolled courses</span><strong>${rows.length}</strong></div>
     <div class="info-item"><span>Credit hours</span><strong>${rows.reduce((n, r) => n + r.credits, 0)}</strong></div>
     <div class="info-item"><span>GPA</span><strong>${fmtGpa(gpaOf(rows))}</strong></div>
    </div></div></div>`;
  $('#pf').onsubmit = e => {
    e.preventDefault();
    const next = { id: p.id, phone: $('#phone').value.trim(), dob: $('#dob').value, gender: $('#gender').value, department: $('#department').value, year: $('#year').value, address: $('#address').value.trim() };
    let ok = true;
    const flag = (id, msg) => { $('#' + id + 'Err').textContent = msg; $('#' + id).classList.toggle('invalid', !!msg); if (msg) ok = false; };
    flag('phone', next.phone && !/^\+?\d{8,15}$/.test(next.phone.replace(/[\s-]/g, '')) ? 'Enter 8 to 15 digits.' : '');
    flag('dob', next.dob && new Date(next.dob) > new Date() ? 'Date of birth cannot be in the future.' : '');
    if (!ok) return toast('Please fix the highlighted fields.');
    toast(saveProfile(next) ? 'Profile saved.' : 'Database error: changes could not be saved.');
  };
}

/* ---------- start ---------- */
const pages = { dashboard, 'my-courses': myCourses, 'course-registration': registration, 'my-grades': myGrades, 'my-attendance': myAttendance, transcript, announcements, profile };
shell();
(pages[PAGE] || dashboard)();
})();
