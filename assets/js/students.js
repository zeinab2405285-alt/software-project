/* Student pages – frontend only. The logged-in student is mocked (STUDENT) and data lives in localStorage.
   Replace STUDENT / COURSES / NOTES / state with API calls (PHP) when the backend is ready. */
(() => {
const USER_KEY = 'sis_current_student', TERM = 'Fall 2026', MAX_CREDITS = 18, PASS = 60, MIN_ATT = 75;
const PAGE = document.body.dataset.page;
const DEPTS = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts'];
/* The signed-in student. Member 1's login should save {id,name,email,department,year} here (or use the PHP session). */
let STUDENT = null; try { STUDENT = JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) {}
const guest = !STUDENT;   // not signed in = browse every page as a guest with empty data
if (guest) STUDENT = { id: '—', name: 'Guest', email: 'guest', department: '—', year: '—' };
const dataKey = email => 'sis_student_data:' + email;
const KEY = dataKey(STUDENT ? STUDENT.email : '');
const COURSES = [
 [1,'CS101','Intro to Programming',3,'Dr. Salma Nabil','Sun 10:00–12:00',40,38,[]],
 [2,'CS102','Object-Oriented Programming',3,'Dr. Salma Nabil','Mon 10:00–12:00',40,30,[1]],
 [3,'CS201','Data Structures',3,'Dr. Hany Fathy','Tue 12:00–14:00',35,33,[2]],
 [4,'CS301','Databases',3,'Dr. Mariam Zaki','Wed 10:00–12:00',35,20,[3]],
 [5,'CS302','Operating Systems',3,'Dr. Hany Fathy','Thu 12:00–14:00',35,34,[3]],
 [6,'CS303','Software Engineering',3,'Dr. Mariam Zaki','Sun 14:00–16:00',30,30,[3]],
 [7,'CS304','Computer Networks',3,'Dr. Tamer Wagdy','Mon 14:00–16:00',35,12,[3]],
 [8,'MA101','Calculus I',4,'Dr. Laila Samy','Tue 08:00–10:00',50,45,[]],
 [9,'MA102','Calculus II',4,'Dr. Laila Samy','Wed 08:00–10:00',50,40,[8]],
 [10,'PH101','Physics I',3,'Dr. Adel Ramzy','Thu 08:00–10:00',50,41,[]],
 [11,'EN101','Academic English',2,'Ms. Dina Omar','Sun 08:00–10:00',60,52,[]]
].map(c => ({ id: c[0], code: c[1], title: c[2], credits: c[3], teacher: c[4], schedule: c[5], capacity: c[6], taken: c[7], pre: c[8] }));
const NOTES = [
 { id: 1, cat: 'Registration', title: 'Course registration closes soon', body: 'Registration for Fall 2026 closes on 30 October. Drop or add courses before the deadline.', date: '2026-10-20' },
 { id: 2, cat: 'Academic', title: 'Midterm exam schedule', body: 'Midterm exams start on 2 November. The full timetable is available at the registrar office.', date: '2026-10-18' },
 { id: 3, cat: 'Events', title: 'Career day', body: 'Meet employers at the annual career day in the main hall on 12 November.', date: '2026-10-10' },
 { id: 4, cat: 'Academic', title: 'Attendance policy reminder', body: 'Students with attendance below 75% may be barred from the final exam.', date: '2026-10-02' },
 { id: 5, cat: 'Registration', title: 'Prerequisite changes', body: 'CS201 now requires CS102. Check the course registration page for details.', date: '2026-09-25' }
];
const att = (day, pat) => [...pat].map((s, i) => [new Date(Date.UTC(2026, 8, day + 7 * i)).toISOString().slice(0, 10), s]);
const DEMO = { read: [3], profile: { phone: '01012345678', address: 'Giza, Egypt' }, enrollments: [
 { courseId: 1, term: 'Fall 2025', grade: 85, att: [] }, { courseId: 8, term: 'Fall 2025', grade: 72, att: [] }, { courseId: 11, term: 'Fall 2025', grade: 91, att: [] },
 { courseId: 2, term: 'Spring 2026', grade: 78, att: [] }, { courseId: 10, term: 'Spring 2026', grade: 55, att: [] },
 { courseId: 3, term: TERM, grade: null, att: att(6, 'PPPLPAPPPE') }, { courseId: 9, term: TERM, grade: null, att: att(7, 'PAPPAAPLPA') } ] };

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const course = id => COURSES.find(c => c.id === id);
const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const blank = () => ({ read: [], profile: { phone: '', address: '' }, enrollments: [] });
let S; try { S = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch (e) { S = blank(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { toast('Could not save changes.'); return false; } }

const letter = g => g == null ? '-' : g >= 90 ? 'A' : g >= 80 ? 'B' : g >= 70 ? 'C' : g >= 60 ? 'D' : 'F';
const pts = g => ({ A: 4, B: 3, C: 2, D: 1 }[letter(g)] || 0);
function gpa(list) {
  const g = list.filter(e => e.grade != null), cr = g.reduce((s, e) => s + course(e.courseId).credits, 0);
  return cr ? +(g.reduce((s, e) => s + pts(e.grade) * course(e.courseId).credits, 0) / cr).toFixed(2) : 0;
}
const cnt = (e, k) => e.att.filter(a => a[1] === k).length;
const rate = e => { const t = e.att.length - cnt(e, 'E'); return t ? Math.round(100 * (cnt(e, 'P') + cnt(e, 'L')) / t) : null; };
const current = () => S.enrollments.filter(e => e.term === TERM);
const passed = id => S.enrollments.some(e => e.courseId === id && e.grade != null && e.grade >= PASS);
const unread = () => NOTES.filter(n => !S.read.includes(n.id)).length;
const bar = p => `<div class="bar-label"><span></span><span>${p}%</span></div><div class="bar-track"><div class="bar-fill ${p < MIN_ATT ? 'warn' : ''}" style="width:${p}%"></div></div>`;
const empty = (t, m) => `<div class="empty-state"><strong>${t}</strong>${m || ''}</div>`;

let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2800); }
function modal(title, body, actions) {
  const m = document.createElement('div'); m.className = 'modal-backdrop';
  m.innerHTML = `<div class="modal"><div class="modal-head"><h2>${title}</h2><button class="modal-close" data-x>×</button></div>${body}<div class="modal-actions">${actions || '<button class="btn btn-secondary" data-x>Close</button>'}</div></div>`;
  document.body.appendChild(m); return m;
}
function confirmBox(title, msg, label, danger, ok) {
  const m = modal(title, `<p class="muted" style="line-height:1.6">${msg}</p>`, `<button class="btn btn-secondary" data-x>Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${label}</button>`);
  m.onclick = e => { if (e.target === m || e.target.hasAttribute('data-x')) m.remove(); if (e.target.hasAttribute('data-ok')) { m.remove(); ok(); } };
}

/* ---------- layout shell ---------- */
function shell() {
  const page = document.body.dataset.page, c = $('#content');
  const link = (f, ic, l, badge) => `<a class="nav-item ${page === f ? 'active' : ''}" href="${f === '#' ? '#' : f + '.html'}"><span>${ic}</span>${l}${badge ? `<i id="badge">${badge}</i>` : ''}</a>`;
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="app-shell"><aside class="sidebar" id="sidebar">
   <div class="brand"><div class="brand-mark">S</div><div><strong>SIS</strong><small>Student Portal</small></div></div>
   <div class="nav-label">MY ACADEMICS</div><nav>
    ${link('my-courses', '📘', 'My Courses')}${link('course-registration', '📝', 'Course Registration')}${link('my-grades', '🎓', 'My Grades')}
    ${link('my-attendance', '✔', 'My Attendance')}${link('transcript', '📄', 'Transcript')}</nav>
   <div class="nav-label" style="padding-top:20px">ACCOUNT</div><nav>${link('profile', '👤', 'Profile')}${link('announcements', '🔔', 'Announcements', unread() || '')}</nav>
   <div class="sidebar-bottom"><div class="admin-avatar">${initials(STUDENT.name)}</div><div class="admin-details"><strong>${STUDENT.name}</strong><small>${guest ? 'Not signed in' : STUDENT.id}</small></div>${guest ? '' : '<button class="btn btn-secondary btn-small" id="signout">Sign out</button>'}</div></aside>
  <div class="main-area"><header class="topbar"><div class="topbar-left">
   <button class="mobile-menu" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
   <div><div class="eyebrow">STUDENT PORTAL · ${TERM.toUpperCase()}</div><h1>${document.body.dataset.title}</h1></div></div>
   <div class="topbar-right"><span class="today">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>${guest ? `<a class="btn btn-primary" href="sign-in.html?next=${PAGE}.html">Sign in</a>` : `<div class="top-avatar">${initials(STUDENT.name)}</div>`}</div></header>
   <div class="page-content" id="pc">${guest ? `<div class="notice">👋 You are browsing as a guest – <a href="sign-in.html?next=${PAGE}.html">sign in</a> to see your own courses, grades and attendance.</div>` : ''}</div>
   <footer>Student Information System<span>·</span>Student Portal<span class="footer-right">© 2026</span></footer></div></div><div class="toast" id="toast"></div>`);
  $('#pc').appendChild(c);
}
document.addEventListener('click', e => { const m = e.target.closest('.modal-backdrop'); if (m && !m.querySelector('[data-ok]') && (e.target === m || e.target.hasAttribute('data-x'))) m.remove(); });

/* ---------- course registration ---------- */
function eligibility(c) {
  if (current().some(e => e.courseId === c.id)) return { st: 'registered' };
  if (passed(c.id)) return { st: 'passed' };
  const miss = c.pre.filter(p => !passed(p)).map(p => course(p).code);
  if (miss.length) return { st: 'locked', miss };
  if (c.taken >= c.capacity) return { st: 'full' };
  return { st: S.enrollments.some(e => e.courseId === c.id) ? 'retake' : 'available' };
}
function registrationPage() {
  let q = '';
  $('#content').innerHTML = `<div class="panel">
   <div class="credit-bar" id="cb"></div>
   <div class="filter-bar"><div class="search-box"><span>🔍</span><input id="q" placeholder="Search by code, title or instructor…"></div></div>
   <div class="table-wrap"><table><thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Instructor / Schedule</th><th>Prerequisites</th><th>Seats</th><th>Status</th><th>Action</th></tr></thead><tbody id="rows"></tbody></table></div></div>`;
  const draw = () => {
    const cr = current().reduce((s, e) => s + course(e.courseId).credits, 0), p = Math.round(100 * cr / MAX_CREDITS);
    $('#cb').innerHTML = `<div class="bar-label"><span><b>Credit load this term</b></span><span>${cr} / ${MAX_CREDITS} credits</span></div><div class="bar-track"><div class="bar-fill" style="width:${p}%"></div></div>`;
    const t = q.toLowerCase();
    $('#rows').innerHTML = COURSES.filter(c => !t || [c.code, c.title, c.teacher].some(v => v.toLowerCase().includes(t))).map(c => {
      const el = eligibility(c), seats = c.capacity - c.taken - (el.st === 'registered' ? 1 : 0);
      const st = { registered: '<span class="status active">Registered</span>', passed: '<span class="status approved">Completed</span>', full: '<span class="status absent">Full</span>',
        locked: `<span class="status pending">Needs ${el.miss && el.miss.join(', ')}</span>`, available: '<span class="status approved">Available</span>', retake: '<span class="status pending">Retake</span>' }[el.st];
      const act = el.st === 'registered' ? `<button class="btn btn-danger btn-small" data-drop="${c.id}">Drop</button>`
        : ['available', 'retake'].includes(el.st) ? `<button class="btn btn-primary btn-small" data-reg="${c.id}">Register</button>` : '<span class="muted">—</span>';
      return `<tr><td><b>${c.code}</b></td><td>${c.title}</td><td>${c.credits}</td><td>${c.teacher}<br><small class="muted">${c.schedule}</small></td>
       <td>${c.pre.map(p => course(p).code).join(', ') || '—'}</td><td>${seats} / ${c.capacity}</td><td>${st}</td><td>${act}</td></tr>`;
    }).join('') || `<tr><td colspan="8">${empty('No courses found')}</td></tr>`;
  };
  $('#q').oninput = e => { q = e.target.value.trim(); draw(); };
  $('#rows').onclick = e => {
    const r = e.target.closest('[data-reg]'), d = e.target.closest('[data-drop]');
    if (r) {
      const c = course(+r.dataset.reg), el = eligibility(c), load = current().reduce((s, x) => s + course(x.courseId).credits, 0);
      if (el.st === 'registered') return toast('You are already registered in this course.');
      if (el.st === 'passed') return toast('You have already passed this course.');
      if (el.st === 'locked') return toast('Missing prerequisites: ' + el.miss.join(', '));
      if (el.st === 'full') return toast('This course is full.');
      if (load + c.credits > MAX_CREDITS) return toast(`Credit limit exceeded (max ${MAX_CREDITS}).`);
      confirmBox('Register for course', `Register for <b>${c.code} – ${c.title}</b> (${c.credits} credits)?`, 'Register', false, () => {
        S.enrollments.push({ courseId: c.id, term: TERM, grade: null, att: [] });
        if (save()) { toast(`Registered for ${c.code}.`); draw(); } else S.enrollments.pop();
      });
    }
    if (d) {
      const c = course(+d.dataset.drop);
      confirmBox('Drop course', `Drop <b>${c.code} – ${c.title}</b>? Your seat may be given to another student.`, 'Drop', true, () => {
        const old = S.enrollments; S.enrollments = old.filter(x => !(x.courseId === c.id && x.term === TERM));
        if (save()) { toast(`Dropped ${c.code}.`); draw(); } else S.enrollments = old;
      });
    }
  };
  draw();
}

/* ---------- my courses ---------- */
function myCoursesPage() {
  const cur = current(), cr = cur.reduce((s, e) => s + course(e.courseId).credits, 0);
  $('#content').innerHTML = `<div class="report-cards">
   <div class="report-card"><span>Registered courses</span><strong>${cur.length}</strong></div>
   <div class="report-card"><span>Credit hours</span><strong>${cr} / ${MAX_CREDITS}</strong></div>
   <div class="report-card"><span>Current term</span><strong style="font-size:18px">${TERM}</strong></div></div>
   <div class="panel"><div class="table-heading"><h3>Courses this term</h3><a class="btn btn-primary btn-small" href="course-registration.html">+ Register for courses</a></div>
   <div class="table-wrap"><table><thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Instructor</th><th>Schedule</th><th>Attendance</th></tr></thead><tbody>
   ${cur.map(e => { const c = course(e.courseId), r = rate(e);
     return `<tr><td><b>${c.code}</b></td><td>${c.title}</td><td>${c.credits}</td><td>${c.teacher}</td><td>${c.schedule}</td><td>${r == null ? '—' : bar(r)}</td></tr>`; }).join('')
     || `<tr><td colspan="6">${empty('No courses registered', 'Go to Course Registration to add courses.')}</td></tr>`}
   </tbody></table></div></div>`;
}

/* ---------- my grades ---------- */
function gradesPage() {
  const graded = S.enrollments.filter(e => e.grade != null), terms = [...new Set(S.enrollments.map(e => e.term))];
  let term = '';
  $('#content').innerHTML = `<div class="report-cards">
   <div class="report-card"><span>Cumulative GPA</span><strong>${gpa(graded)}</strong></div>
   <div class="report-card"><span>Credits earned</span><strong>${graded.filter(e => e.grade >= PASS).reduce((s, e) => s + course(e.courseId).credits, 0)}</strong></div>
   <div class="report-card"><span>Courses passed</span><strong>${graded.filter(e => e.grade >= PASS).length} / ${graded.length}</strong></div></div>
   <div class="panel"><div class="table-heading"><h3>Grade report</h3>
    <select id="term" style="width:auto"><option value="">All terms</option>${terms.map(t => `<option>${t}</option>`).join('')}</select></div>
   <div class="table-wrap"><table><thead><tr><th>Term</th><th>Code</th><th>Course</th><th>Credits</th><th>Grade</th><th>Letter</th><th>Result</th></tr></thead><tbody id="rows"></tbody></table></div></div>`;
  const draw = () => {
    $('#rows').innerHTML = S.enrollments.filter(e => !term || e.term === term).map(e => { const c = course(e.courseId);
      const res = e.grade == null ? '<span class="status pending">In progress</span>' : e.grade >= PASS ? '<span class="status approved">Passed</span>' : '<span class="status absent">Failed</span>';
      return `<tr><td>${e.term}</td><td><b>${c.code}</b></td><td>${c.title}</td><td>${c.credits}</td><td>${e.grade ?? '—'}</td><td><span class="grade-pill">${letter(e.grade)}</span></td><td>${res}</td></tr>`; }).join('')
      || `<tr><td colspan="7">${empty('No grades yet')}</td></tr>`;
  };
  $('#term').onchange = e => { term = e.target.value; draw(); }; draw();
}

/* ---------- my attendance ---------- */
function attendancePage() {
  const cur = current().filter(e => e.att.length), low = cur.filter(e => rate(e) < MIN_ATT);
  $('#content').innerHTML = `${low.length ? `<div class="notice" style="background:#ffeded;border-color:#f5c6c9;color:#a8343b">⚠ Attendance below ${MIN_ATT}% in: <b>${low.map(e => course(e.courseId).code).join(', ')}</b>. You may be barred from the final exam.</div>` : ''}
   <div class="panel"><div class="table-heading"><h3>Attendance – ${TERM}</h3><small>Late counts as attended; excused absences are not counted.</small></div>
   <div class="table-wrap"><table><thead><tr><th>Course</th><th>Present</th><th>Late</th><th>Absent</th><th>Excused</th><th style="min-width:160px">Attendance</th><th>Status</th><th>History</th></tr></thead><tbody>
   ${cur.map(e => { const c = course(e.courseId), r = rate(e);
     return `<tr><td><b>${c.code}</b> – ${c.title}</td><td>${cnt(e, 'P')}</td><td>${cnt(e, 'L')}</td><td>${cnt(e, 'A')}</td><td>${cnt(e, 'E')}</td><td>${bar(r)}</td>
      <td><span class="status ${r < MIN_ATT ? 'absent' : 'present'}">${r < MIN_ATT ? 'At risk' : 'Good'}</span></td><td><button class="action-btn" data-h="${e.courseId}">View</button></td></tr>`; }).join('')
     || `<tr><td colspan="8">${empty('No attendance records yet')}</td></tr>`}</tbody></table></div></div>`;
  $('#content').onclick = ev => {
    const b = ev.target.closest('[data-h]'); if (!b) return;
    const e = current().find(x => x.courseId === +b.dataset.h), c = course(e.courseId);
    const cls = { P: 'present', L: 'late', A: 'absent', E: 'pending' }, name = { P: 'Present', L: 'Late', A: 'Absent', E: 'Excused' };
    modal(`${c.code} – Attendance history`, `<div class="table-wrap"><table style="min-width:0"><thead><tr><th>#</th><th>Date</th><th>Status</th></tr></thead><tbody>
      ${e.att.map((a, i) => `<tr><td>${i + 1}</td><td>${a[0]}</td><td><span class="status ${cls[a[1]]}">${name[a[1]]}</span></td></tr>`).join('')}</tbody></table></div>`);
  };
}

/* ---------- transcript ---------- */
function transcriptPage() {
  const graded = S.enrollments.filter(e => e.grade != null), terms = [...new Set(graded.map(e => e.term))];
  const earned = graded.filter(e => e.grade >= PASS).reduce((s, e) => s + course(e.courseId).credits, 0);
  $('#content').innerHTML = `<div class="panel">
   <div class="table-heading"><div><h3>Official academic transcript</h3><small>Unofficial copy – generated ${new Date().toLocaleDateString()}</small></div><button class="btn btn-primary btn-small noprint" onclick="window.print()">Print / Save PDF</button></div>
   <div class="info-grid"><div class="info-item"><span>Student</span><strong>${STUDENT.name}</strong></div><div class="info-item"><span>Student ID</span><strong>${STUDENT.id}</strong></div><div class="info-item"><span>Department</span><strong>${STUDENT.department}</strong></div></div>
   ${terms.map(t => { const l = graded.filter(e => e.term === t);
     return `<div class="term-title"><b>${t}</b><span>Term GPA: ${gpa(l)}</span></div><div class="table-wrap"><table><thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Grade</th><th>Letter</th></tr></thead><tbody>
      ${l.map(e => { const c = course(e.courseId); return `<tr><td><b>${c.code}</b></td><td>${c.title}</td><td>${c.credits}</td><td>${e.grade}</td><td><span class="grade-pill">${letter(e.grade)}</span></td></tr>`; }).join('')}</tbody></table></div>`; }).join('') || empty('No graded courses yet')}
   <div class="report-cards" style="margin-top:22px"><div class="report-card"><span>Cumulative GPA</span><strong>${gpa(graded)}</strong></div><div class="report-card"><span>Credits earned</span><strong>${earned}</strong></div><div class="report-card"><span>Terms completed</span><strong>${terms.length}</strong></div></div></div>`;
}

/* ---------- profile ---------- */
function profilePage() {
  if (guest) { $('#content').innerHTML = `<div class="panel">${empty('Your profile', 'Sign in to see and edit your details.')}<div style="text-align:center"><a class="btn btn-primary" href="sign-in.html?next=profile.html">Sign in</a></div></div>`; return; }
  const item = (l, v) => `<div class="info-item"><span>${l}</span><strong>${esc(v)}</strong></div>`;
  $('#content').innerHTML = `<div class="panel"><div class="person" style="margin-bottom:20px"><div class="mini-avatar" style="width:54px;height:54px;font-size:16px">${initials(STUDENT.name)}</div><div><h2 style="margin:0;color:var(--navy)">${STUDENT.name}</h2><span class="status active">Active student</span></div></div>
   <div class="info-grid">${item('Student ID', STUDENT.id)}${item('Email', STUDENT.email)}${item('Department', STUDENT.department)}${item('Year', 'Year ' + STUDENT.year)}</div>
   <div class="panel-header"><div><h3>Contact details</h3><p>You can update your phone number and address.</p></div></div>
   <form id="form" class="form-grid" novalidate>
    <label>Phone<input name="phone" inputmode="numeric" value="${esc(S.profile.phone)}"><span class="field-error" data-err="phone"></span></label>
    <label>Email (read-only)<input value="${esc(STUDENT.email)}" readonly></label>
    <label class="full">Address<textarea name="address" maxlength="200">${esc(S.profile.address)}</textarea><span class="field-error" data-err="address"></span></label>
    <div class="form-actions full"><button class="btn btn-primary">Save changes</button></div></form></div>`;
  $('#form').onsubmit = ev => {
    ev.preventDefault();
    const v = Object.fromEntries([...new FormData(ev.target)].map(([k, x]) => [k, String(x).trim()])), er = {};
    if (v.phone && !/^\d{10,15}$/.test(v.phone)) er.phone = 'Phone must be 10–15 digits.';
    document.querySelectorAll('[data-err]').forEach(el => { el.textContent = er[el.dataset.err] || ''; });
    document.querySelectorAll('#form input,#form textarea').forEach(el => el.classList.toggle('invalid', !!er[el.name]));
    if (Object.keys(er).length) return;
    const old = S.profile; S.profile = v;
    if (save()) toast('Profile updated.'); else S.profile = old;
  };
}

/* ---------- announcements ---------- */
function announcementsPage() {
  let cat = '';
  $('#content').innerHTML = `<div class="panel"><div class="filter-bar">
   <select id="cat"><option value="">All categories</option>${[...new Set(NOTES.map(n => n.cat))].map(c => `<option>${c}</option>`).join('')}</select>
   <button class="btn btn-secondary right" id="all">Mark all as read</button></div><div id="list"></div></div>`;
  const draw = () => {
    $('#list').innerHTML = NOTES.filter(n => !cat || n.cat === cat).map(n => { const u = !S.read.includes(n.id);
      return `<div class="announcement-card ${u ? 'unread' : ''}"><h4>${esc(n.title)} ${u ? '<span class="status pending">New</span>' : ''}</h4><p>${esc(n.body)}</p>
       <div class="announcement-meta"><span>${n.cat} · ${n.date}</span>${u ? `<button class="link-button" data-r="${n.id}">Mark as read</button>` : ''}</div></div>`; }).join('') || empty('No announcements');
    const b = $('#badge'); if (b) { if (unread()) b.textContent = unread(); else b.remove(); }
  };
  $('#cat').onchange = e => { cat = e.target.value; draw(); };
  $('#all').onclick = () => { S.read = NOTES.map(n => n.id); save(); draw(); toast('All announcements marked as read.'); };
  $('#list').onclick = e => { const b = e.target.closest('[data-r]'); if (b) { S.read.push(+b.dataset.r); save(); draw(); } };
  draw();
}

/* ---------- temporary sign-in (stand-in for Member 1's login page) ---------- */
function signInPage() {
  const next = (() => { const n = new URLSearchParams(location.search).get('next') || ''; return /^[a-z-]+\.html$/.test(n) && n !== 'sign-in.html' ? n : 'my-courses.html'; })();
  const idx = () => { try { return JSON.parse(localStorage.getItem('sis_students_index')) || {}; } catch (e) { return {}; } };
  $('#content').innerHTML = `<div class="auth-wrap"><div class="panel" style="width:min(480px,100%)">
   <div class="panel-header"><div><h3>Student sign in</h3><p>Temporary page – Member 1's login will replace it</p></div></div>
   <div class="notice" id="msg" style="display:none"></div>
   <form id="f" class="form-grid" novalidate>
    <label class="full">Email<input name="email" type="email"></label>
    <label class="full">Full name (first time only)<input name="name" maxlength="80"></label>
    <label>Department (first time only)<select name="department"><option value="">Select…</option>${DEPTS.map(d => `<option>${d}</option>`).join('')}</select></label>
    <label>Year (first time only)<select name="year"><option value="">Select…</option>${[1, 2, 3, 4, 5].map(y => `<option>${y}</option>`).join('')}</select></label>
    <label class="full" style="display:flex;align-items:center;gap:8px"><input type="checkbox" name="demo" style="width:auto">Fill my account with sample grades &amp; attendance (testing only)</label>
    <button class="btn btn-primary full">Sign in</button></form>
   <p><a href="${next}">← Continue browsing as guest</a></p><p class="muted">New email = a new student with an empty account. Next time only the email is needed.</p></div></div>`;
  $('#f').onsubmit = ev => {
    ev.preventDefault();
    const f = new FormData(ev.target), email = String(f.get('email')).trim().toLowerCase(), say = m => { const b = $('#msg'); b.textContent = m; b.style.display = 'block'; };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say('Enter a valid email address.');
    const users = idx(); let u = users[email];
    if (!u) {
      const name = String(f.get('name')).trim(), department = f.get('department'), year = +f.get('year');
      if (name.length < 3 || !/^[\p{L}\s.'-]+$/u.test(name)) return say('New student: enter your full name (letters only).');
      if (!DEPTS.includes(department) || !year) return say('New student: choose your department and year.');
      u = { id: 'S-' + (1001 + Object.keys(users).length), name, email, department, year }; users[email] = u;
      try { localStorage.setItem('sis_students_index', JSON.stringify(users)); localStorage.setItem(dataKey(email), JSON.stringify(f.get('demo') ? DEMO : blank())); }
      catch (e) { return say('Could not save your account.'); }
    }
    try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch (e) { return say('Could not sign in.'); }
    location.href = next;
  };
}

if (PAGE === 'sign-in') signInPage();
else {
  shell();
  if ($('#signout')) $('#signout').onclick = () => { try { localStorage.removeItem(USER_KEY); } catch (e) {} location.href = PAGE + '.html'; };
  ({ 'course-registration': registrationPage, 'my-courses': myCoursesPage, 'my-grades': gradesPage, 'my-attendance': attendancePage,
     transcript: transcriptPage, profile: profilePage, announcements: announcementsPage })[PAGE]();
}
})();
