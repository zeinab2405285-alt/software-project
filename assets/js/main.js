
const SIS = (function () {
  // The only built-in account. Teachers and students must register first.
  const ADMIN_USER = { name: "Admin User", email: "admin@sis.edu", password: "Admin@123", role: "admin" };
  const ROLE_HOME = { admin: "../admin/dashboard.html", teacher: "../teacher/dashboard.html", student: "../student/dashboard.html" };
  const LOGIN_PAGE = "../auth/login.html";
  const EMAIL_RE = /^\S+@\S+\.\S+$/;

  // ---------- Storage helpers ----------
  function readJson(storage, key, fallback) {
    try { const v = JSON.parse(storage.getItem(key)); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function getSession() { return readJson(sessionStorage, "sis_user", null); }
  function setSession(user) {
    sessionStorage.setItem("sis_user", JSON.stringify({ name: user.name, email: user.email, role: user.role }));
  }
  function logout() { sessionStorage.removeItem("sis_user"); window.location.href = LOGIN_PAGE; }

  // ---------- Users ----------
  function allUsers() { return [ADMIN_USER].concat(readJson(localStorage, "sis_users", [])); }
  function findByEmail(email) {
    const clean = email.trim().toLowerCase();
    return allUsers().find(function (u) { return u.email === clean; }) || null;
  }
  function findUser(email, password) {
    const u = findByEmail(email);
    return u && u.password === password ? u : null;
  }
  function getRegistrationRole(email) {
    const clean = email.trim().toLowerCase();
    if (/^[^@\s]+@sisstudent\.edu$/.test(clean)) return "student";
    if (/^[^@\s]+@sisteacher\.edu$/.test(clean)) return "teacher";
    return null;
  }
  function addUser(user) {
    const list = readJson(localStorage, "sis_users", []);
    list.push({ name: user.name, email: user.email.trim().toLowerCase(), password: user.password, role: user.role });
    localStorage.setItem("sis_users", JSON.stringify(list));
  }

  // ---------- Protect pages ----------
  function requireRole(allowed) {
    const user = getSession();
    if (!user) { window.location.href = LOGIN_PAGE; return null; }
    if (allowed.indexOf(user.role) === -1) { window.location.href = ROLE_HOME[user.role]; return null; }
    return user;
  }

  // ---------- Small UI helpers ----------
  function escapeHtml(t) {
    const m = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(t).replace(/[&<>"']/g, function (c) { return m[c]; });
  }
  function initials(name) {
    return name.split(" ").filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join("");
  }
  function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) { toast = document.createElement("div"); toast.id = "toast"; toast.className = "toast"; document.body.appendChild(toast); }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  // ---------- Shared layout ----------
  const MENUS = {
    admin: [["dashboard","🏠","Dashboard",true],["students","🎓","Students"],["teachers","👩‍🏫","Teachers"],["courses","📚","Courses"],["reports","📊","Reports"],["announcements","📢","Announcements"]],
    teacher: [["dashboard","🏠","Dashboard",true],["courses","📚","My Courses"],["grades","📝","Grades"],["attendance","✅","Attendance"],["announcements","📢","Announcements"]],
    student: [["dashboard","🏠","Dashboard",true],["courses","📚","My Courses"],["grades","📝","My Grades"],["attendance","✅","My Attendance"],["announcements","📢","Announcements"]]
  };
  const STATS = {
    admin: [["Students","🎓","1,240","+12 this month"],["Teachers","👩‍🏫","86","Active teachers"],["Courses","📚","64","This semester"],["Attendance","✅","94%","+2% vs last month"]],
    teacher: [["My Courses","📚","4","This semester"],["Students","🎓","112","Across all courses"],["Pending Grades","📝","18","To be submitted"],["Attendance","✅","92%","Average this month"]],
    student: [["Enrolled Courses","📚","6","This semester"],["GPA","🏅","3.4","Current"],["Attendance","✅","96%","This month"],["Announcements","📢","3","New"]]
  };

  function initLayout(title) {
    const user = getSession();
    if (!user) return;
    const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    const name = escapeHtml(user.name), ini = escapeHtml(initials(user.name));

    const menu = MENUS[user.role].map(function (m) {
      const link = m[3] ? "dashboard.html" : "#";
      return '<a class="nav-item' + (m[3] ? " active" : "") + '" href="' + link + '"' + (m[3] ? "" : ' data-soon="true"') + '><span>' + m[1] + "</span>" + m[2] + "</a>";
    }).join("");

    document.getElementById("sidebar").innerHTML =
      '<div class="brand"><div class="brand-mark">S</div><div><strong>SIS</strong><small>Student Information System</small></div></div>' +
      '<div class="nav-label">MENU</div><nav>' + menu + "</nav>" +
      '<div class="sidebar-bottom"><div class="admin-avatar">' + ini + '</div><div class="admin-details"><strong>' + name + "</strong><small>" + roleLabel + "</small></div>" +
      '<button class="btn btn-secondary btn-small" id="logoutBtn" type="button">Log out</button></div>';

    const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    document.getElementById("topbar").innerHTML =
      '<div class="topbar-left"><button class="btn btn-secondary mobile-menu" id="menuBtn" type="button">☰</button>' +
      '<div><div class="eyebrow">' + roleLabel.toUpperCase() + " PORTAL</div><h1>" + escapeHtml(title) + "</h1></div></div>" +
      '<div class="topbar-right"><span class="today">' + today + '</span><div class="top-avatar">' + ini + "</div></div>";

    document.getElementById("footer").innerHTML = '© 2026 Student Information System<span>•</span>University project<span class="footer-right">Phase 1 prototype</span>';

    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("menuBtn").addEventListener("click", function () { document.getElementById("sidebar").classList.toggle("open"); });
    document.querySelectorAll("[data-soon]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); showToast("This page is built by another team member."); });
    });
  }

  // One call sets up a whole role dashboard page
  function initDashboard(role) {
    const user = requireRole([role]);
    if (!user) return;
    initLayout(user.role.charAt(0).toUpperCase() + user.role.slice(1) + " Dashboard");
    document.getElementById("welcomeName").textContent = user.name;
    document.getElementById("stats").innerHTML = STATS[role].map(function (s) {
      return '<div class="stat-card"><div class="stat-top">' + s[0] + ' <div class="stat-icon">' + s[1] + '</div></div><div class="stat-number">' + s[2] + '</div><div class="stat-foot">' + s[3] + "</div></div>";
    }).join("");
  }

  // ---------- Form helpers ----------
  function setError(id, msg) { const el = document.getElementById(id + "Error"); if (el) el.textContent = msg; }
  function clearErrors(ids) { ids.forEach(function (id) { setError(id, ""); }); }
  function val(id) { return document.getElementById(id).value; }

  function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;
    const password = document.getElementById("password");
    const passwordToggle = document.getElementById("passwordToggle");
    passwordToggle.addEventListener("click", function () {
      const isVisible = password.type === "text";
      password.type = isVisible ? "password" : "text";
      passwordToggle.textContent = isVisible ? "Show password" : "Hide password";
      passwordToggle.setAttribute("aria-pressed", String(!isVisible));
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(["email", "password", "form"]);
      let ok = true;
      if (!EMAIL_RE.test(val("email").trim())) { setError("email", "Please enter a valid email."); ok = false; }
      if (val("password") === "") { setError("password", "Please enter your password."); ok = false; }
      if (!ok) return;
      const user = findUser(val("email"), val("password"));
      if (!user) { setError("form", "Incorrect email or password."); return; }
      setSession(user);
      window.location.href = ROLE_HOME[user.role];
    });
  }

  function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;
    const ids = ["fullName", "email", "password", "confirmPassword"];
    [["password", "registerPasswordToggle"], ["confirmPassword", "confirmPasswordToggle"]].forEach(function (pair) {
      const password = document.getElementById(pair[0]);
      const toggle = document.getElementById(pair[1]);
      toggle.addEventListener("click", function () {
        const isVisible = password.type === "text";
        password.type = isVisible ? "password" : "text";
        toggle.textContent = isVisible ? "Show password" : "Hide password";
        toggle.setAttribute("aria-pressed", String(!isVisible));
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(ids);
      let ok = true;
      if (val("fullName").trim().length < 3) { setError("fullName", "Please enter your full name."); ok = false; }
      const role = getRegistrationRole(val("email"));
      if (!role) { setError("email", "Use an email ending in @sisstudent.edu or @sisteacher.edu."); ok = false; }
      else if (findByEmail(val("email"))) { setError("email", "This email is already registered."); ok = false; }
      if (val("password").length < 8) { setError("password", "Password must be at least 8 characters."); ok = false; }
      if (val("confirmPassword") !== val("password")) { setError("confirmPassword", "Passwords do not match."); ok = false; }
      if (!ok) return;
      addUser({ name: val("fullName").trim(), email: val("email"), password: val("password"), role: role });
      showToast("Account created! Redirecting to login...");
      setTimeout(function () { window.location.href = "login.html"; }, 1500);
    });
  }

  function initForgotForm() {
    const form = document.getElementById("forgotForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const notice = document.getElementById("successNotice");
      clearErrors(["email"]);
      notice.hidden = true;
      if (!EMAIL_RE.test(val("email").trim())) { setError("email", "Please enter a valid email."); return; }
      notice.hidden = false;
      form.reset();
    });
  }

  function initResetForm() {
    const form = document.getElementById("resetForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(["password", "confirmPassword"]);
      let ok = true;
      if (val("password").length < 8) { setError("password", "Password must be at least 8 characters."); ok = false; }
      if (val("confirmPassword") !== val("password")) { setError("confirmPassword", "Passwords do not match."); ok = false; }
      if (!ok) return;
      showToast("Password updated! Redirecting to login...");
      setTimeout(function () { window.location.href = "login.html"; }, 1500);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLoginForm(); initRegisterForm(); initForgotForm(); initResetForm();
  });

  return { getSession, logout, requireRole, initLayout, initDashboard, showToast };
})();
