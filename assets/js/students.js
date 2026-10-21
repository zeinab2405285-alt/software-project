/* Student management – frontend only (data kept in localStorage).
   Backend mapping: saving -> actions/save-student.php, remove() -> actions/delete-student.php */
(() => {
const KEY = 'sis_students', ROLE = 'admin';                  // change ROLE to test permissions
const CAN = { admin: { add: 1, edit: 1, del: 1 } }[ROLE] || {};
const DEPTS = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts'];
const SEED = [
 ['Ahmed Hassan','ahmed.hassan@sis.edu','Computer Science',3,'active'],['Mona Ali','mona.ali@sis.edu','Engineering',2,'active'],
 ['Omar Khaled','omar.khaled@sis.edu','Business',4,'inactive'],['Sara Mahmoud','sara.mahmoud@sis.edu','Medicine',1,'active'],
 ['Youssef Adel','youssef.adel@sis.edu','Computer Science',2,'active'],['Nour Ibrahim','nour.ibrahim@sis.edu','Arts',3,'active'],
 ['Hana Samir','hana.samir@sis.edu','Engineering',4,'active'],['Karim Tarek','karim.tarek@sis.edu','Business',1,'inactive']
].map((s, i) => ({ id: 'S-' + (1001 + i), name: s[0], email: s[1], phone: '010' + String(1000000 + i * 7919).padStart(8, '0'),
  dob: '200' + (i % 5) + '-0' + (i % 9 + 1) + '-1' + (i % 9), gender: i % 2 ? 'Female' : 'Male', department: s[2], year: s[3],
  address: 'Giza, Egypt', status: s[4] }));

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const pill = s => `<span class="status ${s === 'active' ? 'active' : 'inactive'}">${s === 'active' ? 'Active' : 'Inactive'}</span>`;

let students;
try { students = JSON.parse(localStorage.getItem(KEY)) || SEED; } catch (e) { students = SEED; }
const find = id => students.find(s => s.id === id);

let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2800); }
const flash = m => { try { sessionStorage.setItem('flash', m); } catch (e) {} };

/* Save with database-error handling: data is replaced only if the write succeeds */
function commit(next) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); students = next; return true; }
  catch (e) { toast('Database error: changes could not be saved.'); return false; }
}

/* ---------- layout shell ---------- */
function shell() {
  const c = $('#content'), title = document.body.dataset.title;
  const nav = [['▦','Dashboard','#'],['🎓','Students','students.html'],['📚','Courses','#'],['📊','Reports','#'],['📢','Announcements','#']]
    .map(n => `<a class="nav-item ${n[1] === 'Students' ? 'active' : ''}" href="${n[2]}"><span>${n[0]}</span>${n[1]}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="app-shell"><aside class="sidebar" id="sidebar">
   <div class="brand"><div class="brand-mark">S</div><div><strong>SIS</strong><small>Admin Panel</small></div></div>
   <div class="nav-label">MANAGEMENT</div><nav>${nav}</nav>
   <div class="sidebar-bottom"><div class="admin-avatar">AD</div><div class="admin-details"><strong>Administrator</strong><small>${ROLE}</small></div></div></aside>
  <div class="main-area"><header class="topbar"><div class="topbar-left">
   <button class="mobile-menu" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
   <div><div class="eyebrow">STUDENT MANAGEMENT</div><h1>${title}</h1></div></div>
   <div class="topbar-right"><span class="today">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><div class="top-avatar">AD</div></div></header>
   <div class="page-content" id="pc"></div>
   <footer>Student Information System<span>·</span>Admin<span class="footer-right">© 2026</span></footer></div></div>
  <div class="toast" id="toast"></div>`);
  $('#pc').appendChild(c);
}

function confirmBox(title, msg, label, danger, onOk) {
  const m = document.createElement('div'); m.className = 'modal-backdrop';
  m.innerHTML = `<div class="modal" style="width:min(420px,100%)"><div class="modal-head"><h2>${title}</h2><button class="modal-close" data-x>×</button></div>
   <p class="muted" style="line-height:1.6">${msg}</p>
   <div class="modal-actions"><button class="btn btn-secondary" data-x>Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${label}</button></div></div>`;
  m.onclick = e => { if (e.target === m || e.target.hasAttribute('data-x')) m.remove(); if (e.target.hasAttribute('data-ok')) { m.remove(); onOk(); } };
  document.body.appendChild(m);
}

/* ---------- actions (shared by list + details) ---------- */
function toggleStatus(id, after) {
  const s = find(id), to = s.status === 'active' ? 'inactive' : 'active';
  confirmBox(to === 'inactive' ? 'Deactivate student' : 'Activate student',
    `${to === 'inactive' ? 'Deactivate' : 'Activate'} <b>${esc(s.name)}</b> (${s.id})?`, to === 'inactive' ? 'Deactivate' : 'Activate', to === 'inactive', () => {
    if (commit(students.map(x => x.id === id ? { ...x, status: to } : x))) { toast(`${s.name} is now ${to}.`); after(); }
  });
}
function remove(id, after) {
  if (!CAN.del) return toast('You do not have permission to delete students.');
  const s = find(id);
  confirmBox('Delete student', `Permanently delete <b>${esc(s.name)}</b> (${s.id})? This cannot be undone. You can deactivate instead.`, 'Delete', true, () => {
    if (commit(students.filter(x => x.id !== id))) { flash(`${s.name} was deleted.`); after(); }
  });
}

/* ---------- list page ---------- */
function listPage() {
  const PER = 6; let q = '', dept = '', st = '', page = 1;
  $('#content').innerHTML = `
  <div class="panel">
   <div class="table-heading"><h3>All students</h3><small id="count"></small></div>
   <div class="filter-bar">
    <div class="search-box"><span>🔍</span><input id="q" placeholder="Search by ID, name or department…"></div>
    <select id="dept"><option value="">All departments</option>${DEPTS.map(d => `<option>${d}</option>`).join('')}</select>
    <select id="st"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
    ${CAN.add ? '<a class="btn btn-primary" href="add-student.html">+ Add student</a>' : ''}
   </div>
   <div class="table-wrap"><table><thead><tr><th>ID</th><th>Student</th><th>Department</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead><tbody id="rows"></tbody></table></div>
   <div class="pagination"><span id="info"></span><div><button class="btn btn-secondary btn-small" id="prev">Previous</button><button class="btn btn-secondary btn-small" id="next">Next</button></div></div>
  </div>`;
  const draw = () => {
    const t = q.toLowerCase();
    const list = students.filter(s => (!t || [s.id, s.name, s.department].some(v => v.toLowerCase().includes(t))) && (!dept || s.department === dept) && (!st || s.status === st));
    const pages = Math.max(1, Math.ceil(list.length / PER)); page = Math.min(page, pages);
    const slice = list.slice((page - 1) * PER, page * PER);
    $('#rows').innerHTML = slice.map(s => `<tr class="${s.status === 'inactive' ? 'is-inactive' : ''}">
      <td class="id-cell">${s.id}</td>
      <td><div class="person"><div class="mini-avatar">${initials(s.name)}</div><div><strong>${esc(s.name)}</strong><small>${esc(s.email)}</small></div></div></td>
      <td>${esc(s.department)}</td><td>Year ${s.year}</td><td>${pill(s.status)}</td>
      <td><div class="row-actions"><a class="action-btn" href="student-details.html?id=${s.id}">View</a>
       ${CAN.edit ? `<a class="action-btn" href="edit-student.html?id=${s.id}">Edit</a><button class="action-btn" data-t="${s.id}">${s.status === 'active' ? 'Deactivate' : 'Activate'}</button>` : ''}
       ${CAN.del ? `<button class="action-btn delete" data-d="${s.id}">Delete</button>` : ''}</div></td></tr>`).join('')
      || `<tr><td colspan="6"><div class="empty-state"><strong>No students found</strong>Try a different search or filter.</div></td></tr>`;
    $('#count').textContent = `${list.length} of ${students.length} students`;
    $('#info').textContent = `Page ${page} of ${pages}`;
    $('#prev').disabled = page <= 1; $('#next').disabled = page >= pages;
  };
  $('#q').oninput = e => { q = e.target.value.trim(); page = 1; draw(); };
  $('#dept').onchange = e => { dept = e.target.value; page = 1; draw(); };
  $('#st').onchange = e => { st = e.target.value; page = 1; draw(); };
  $('#prev').onclick = () => { page--; draw(); }; $('#next').onclick = () => { page++; draw(); };
  $('#rows').onclick = e => {
    const t = e.target.closest('[data-t]'), d = e.target.closest('[data-d]');
    if (t) toggleStatus(t.dataset.t, draw); if (d) remove(d.dataset.d, draw);
  };
  draw();
}

/* ---------- details page ---------- */
function detailsPage() {
  const s = find(new URLSearchParams(location.search).get('id'));
  if (!s) { $('#content').innerHTML = `<div class="panel"><div class="empty-state"><strong>Student not found</strong><a class="btn btn-secondary" href="students.html">← Back to students</a></div></div>`; return; }
  const item = (l, v, w) => `<div class="info-item ${w ? 'wide' : ''}"><span>${l}</span><strong>${esc(v) || '—'}</strong></div>`;
  $('#content').innerHTML = `<div class="panel">
   <div class="profile-head"><div class="person"><div class="mini-avatar">${initials(s.name)}</div><div><h2>${esc(s.name)}</h2>${pill(s.status)}</div></div>
    <div class="btn-row"><a class="btn btn-secondary" href="students.html">← Back</a>
     ${CAN.edit ? `<a class="btn btn-primary" href="edit-student.html?id=${s.id}">Edit</a><button class="btn btn-secondary" id="tg">${s.status === 'active' ? 'Deactivate' : 'Activate'}</button>` : ''}
     ${CAN.del ? '<button class="btn btn-danger" id="del">Delete</button>' : ''}</div></div>
   <div class="info-grid">${item('Student ID', s.id)}${item('Email', s.email)}${item('Phone', s.phone)}${item('Date of birth', s.dob)}${item('Gender', s.gender)}
    ${item('Department', s.department)}${item('Year', 'Year ' + s.year)}${item('Status', s.status)}${item('Address', s.address, 1)}</div></div>`;
  if ($('#tg')) $('#tg').onclick = () => toggleStatus(s.id, detailsPage);
  if ($('#del')) $('#del').onclick = () => remove(s.id, () => { location.href = 'students.html'; });
}

/* ---------- add / edit form ---------- */
function validate(v, editingId) {
  const e = {};
  if (!v.name || v.name.length < 3) e.name = 'Full name is required (min 3 characters).';
  else if (!/^[\p{L}\s.'-]+$/u.test(v.name)) e.name = 'Name can only contain letters and spaces.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Enter a valid email address.';
  else if (students.some(s => s.email.toLowerCase() === v.email.toLowerCase() && s.id !== editingId)) e.email = 'This email is already used by another student.';
  if (!/^\d{10,15}$/.test(v.phone)) e.phone = 'Phone must be 10–15 digits.';
  if (!v.dob) e.dob = 'Date of birth is required.';
  else if (new Date(v.dob) > new Date()) e.dob = 'Date of birth cannot be in the future.';
  if (!v.gender) e.gender = 'Select a gender.';
  if (!DEPTS.includes(v.department)) e.department = 'Select a department.';
  if (!v.year) e.year = 'Select a year.';
  return e;
}
function formPage(edit) {
  const old = edit ? find(new URLSearchParams(location.search).get('id')) : null;
  if (edit && !old) return detailsPage();
  if (!CAN[edit ? 'edit' : 'add']) { $('#content').innerHTML = '<div class="panel"><div class="empty-state"><strong>Access denied</strong>You do not have permission for this action.</div></div>'; return; }
  const nextId = 'S-' + (Math.max(1000, ...students.map(s => +s.id.slice(2))) + 1);
  const s = old || { id: nextId, name: '', email: '', phone: '', dob: '', gender: '', department: '', year: '', address: '', status: 'active' };
  const f = (k, label, input, full) => `<label class="${full ? 'full' : ''}">${label}${input}<span class="field-error" data-err="${k}"></span></label>`;
  const opts = (arr, val) => arr.map(o => `<option ${String(o) === String(val) ? 'selected' : ''}>${o}</option>`).join('');
  $('#content').innerHTML = `<div class="panel form-card"><div class="panel-header"><div><h3>${edit ? 'Edit' : 'New'} student</h3><p>Fields marked <span class="req">*</span> are required</p></div></div>
   <div class="form-error-banner" id="banner" style="display:none"></div>
   <form id="form" class="form-grid" novalidate>
    ${f('id', 'Student ID', `<input name="id" value="${s.id}" readonly>`)}
    ${f('status', 'Status', `<select name="status">${opts(['active', 'inactive'], s.status)}</select>`)}
    ${f('name', 'Full name <span class="req">*</span>', `<input name="name" value="${esc(s.name)}" maxlength="80">`)}
    ${f('email', 'Email <span class="req">*</span>', `<input name="email" type="email" value="${esc(s.email)}">`)}
    ${f('phone', 'Phone <span class="req">*</span>', `<input name="phone" inputmode="numeric" value="${esc(s.phone)}">`)}
    ${f('dob', 'Date of birth <span class="req">*</span>', `<input name="dob" type="date" value="${s.dob}">`)}
    ${f('gender', 'Gender <span class="req">*</span>', `<select name="gender"><option value="">Select…</option>${opts(['Male', 'Female'], s.gender)}</select>`)}
    ${f('department', 'Department <span class="req">*</span>', `<select name="department"><option value="">Select…</option>${opts(DEPTS, s.department)}</select>`)}
    ${f('year', 'Year <span class="req">*</span>', `<select name="year"><option value="">Select…</option>${opts([1, 2, 3, 4, 5], s.year)}</select>`)}
    ${f('address', 'Address', `<textarea name="address" maxlength="200">${esc(s.address)}</textarea>`, 1)}
    <div class="form-actions full"><a class="btn btn-secondary" href="students.html">Cancel</a><button class="btn btn-primary">${edit ? 'Save changes' : 'Add student'}</button></div>
   </form></div>`;
  $('#form').onsubmit = ev => {
    ev.preventDefault();
    const v = Object.fromEntries([...new FormData(ev.target)].map(([k, x]) => [k, String(x).trim()]));
    const errs = validate(v, old && old.id), bad = Object.keys(errs).length;
    document.querySelectorAll('[data-err]').forEach(el => { el.textContent = errs[el.dataset.err] || ''; });
    document.querySelectorAll('#form input,#form select,#form textarea').forEach(el => el.classList.toggle('invalid', !!errs[el.name]));
    $('#banner').style.display = bad ? 'block' : 'none';
    if (bad) { $('#banner').textContent = 'Please fix the highlighted fields.'; return; }
    const rec = { ...v, year: +v.year };
    const next = edit ? students.map(x => x.id === rec.id ? rec : x) : [...students, rec];
    if (commit(next)) { flash(`${rec.name} was ${edit ? 'updated' : 'added'} successfully.`); location.href = 'students.html'; }
  };
}

/* ---------- start ---------- */
shell();
try { const m = sessionStorage.getItem('flash'); if (m) { sessionStorage.removeItem('flash'); setTimeout(() => toast(m), 150); } } catch (e) {}
({ list: listPage, details: detailsPage, add: () => formPage(false), edit: () => formPage(true) })[document.body.dataset.mode]();
})();

