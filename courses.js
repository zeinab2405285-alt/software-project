const STORAGE_KEY = "campuscore_courses_v1";

const starterCourses = [
  {id:"c1",code:"CSC101",name:"Introduction to Computer Science",department:"Computer Science",instructor:"Dr. Ahmed Hassan",credits:3,semester:"Fall 2026",prerequisite:"None",status:"Active"},
  {id:"c2",code:"CSC220",name:"Computer Organization",department:"Computer Science",instructor:"Dr. Mariam Ali",credits:3,semester:"Fall 2026",prerequisite:"CSC120",status:"Active"},
  {id:"c3",code:"AI201",name:"Introduction to Artificial Intelligence",department:"Artificial Intelligence",instructor:"Dr. Omar Khaled",credits:3,semester:"Fall 2026",prerequisite:"CSC101",status:"Active"},
  {id:"c4",code:"IT210",name:"Database Management Systems",department:"Information Technology",instructor:"Dr. Salma Nabil",credits:4,semester:"Spring 2027",prerequisite:"None",status:"Inactive"}
];

const $ = (id) => document.getElementById(id);
let courses = loadCourses();
let toastTimer;

function loadCourses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterCourses;
  } catch (error) {
    console.error("Could not load saved courses:", error);
    return starterCourses;
  }
}
function saveCourses() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); }
  catch (error) { showToast("Could not save data in this browser."); }
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}
function renderCourses() {
  const query = $("searchInput").value.trim().toLowerCase();
  const department = $("departmentFilter").value;
  const status = $("statusFilter").value;
  const filtered = courses.filter(course => {
    const searchable = [course.code, course.name, course.instructor, course.department].join(" ").toLowerCase();
    return searchable.includes(query) &&
      (!department || course.department === department) &&
      (!status || course.status === status);
  });

  $("coursesTable").innerHTML = filtered.length ? filtered.map(course => `
    <tr>
      <td><div class="course-name"><strong>${escapeHTML(course.name)}</strong><small>${escapeHTML(course.code)}${course.prerequisite && course.prerequisite !== "None" ? " · Prerequisite: " + escapeHTML(course.prerequisite) : ""}</small></div></td>
      <td>${escapeHTML(course.department)}</td>
      <td>${escapeHTML(course.instructor)}</td>
      <td>${escapeHTML(course.credits)} hrs</td>
      <td>${escapeHTML(course.semester)}</td>
      <td><span class="status ${course.status.toLowerCase()}">${escapeHTML(course.status)}</span></td>
      <td><div class="action-group">
        <button class="action-btn" data-action="edit" data-id="${escapeHTML(course.id)}" aria-label="Edit ${escapeHTML(course.code)}">Edit</button>
        <button class="action-btn delete" data-action="delete" data-id="${escapeHTML(course.id)}" aria-label="Delete ${escapeHTML(course.code)}">Delete</button>
      </div></td>
    </tr>`).join("") : `<tr><td colspan="7"><div class="empty-state"><strong>No courses found</strong>Try changing your search or filters.</div></td></tr>`;

  $("resultCount").textContent = `${filtered.length} course${filtered.length === 1 ? "" : "s"}`;
  $("totalCourses").textContent = courses.length;
  $("activeCourses").textContent = courses.filter(c => c.status === "Active").length;
  $("departmentCount").textContent = new Set(courses.map(c => c.department)).size;
  $("creditHours").textContent = courses.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  updateDepartmentFilter();
}
function updateDepartmentFilter() {
  const select = $("departmentFilter");
  const selected = select.value;
  const departments = [...new Set(courses.map(c => c.department))].sort();
  select.innerHTML = '<option value="">All departments</option>' +
    departments.map(dep => `<option value="${escapeHTML(dep)}">${escapeHTML(dep)}</option>`).join("");
  if (departments.includes(selected)) select.value = selected;
}
function openModal(course = null) {
  $("courseForm").reset();
  $("courseId").value = course?.id || "";
  $("modalTitle").textContent = course ? "Edit Course" : "Add New Course";
  $("courseCode").value = course?.code || "";
  $("courseName").value = course?.name || "";
  $("courseDepartment").value = course?.department || "";
  $("courseInstructor").value = course?.instructor || "";
  $("courseCredits").value = course?.credits ?? 3;
  $("courseSemester").value = course?.semester || "";
  $("coursePrerequisite").value = course?.prerequisite === "None" ? "" : (course?.prerequisite || "");
  $("courseStatus").value = course?.status || "Active";
  $("courseModal").hidden = false;
  $("courseCode").focus();
}
function closeModal() { $("courseModal").hidden = true; }
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

$("courseForm").addEventListener("submit", event => {
  event.preventDefault();
  const id = $("courseId").value;
  const code = $("courseCode").value.trim().toUpperCase();
  const duplicate = courses.some(course => course.code.toLowerCase() === code.toLowerCase() && course.id !== id);
  if (duplicate) {
    showToast("A course with this code already exists.");
    $("courseCode").focus();
    return;
  }

  const course = {
    id: id || (window.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
    code,
    name: $("courseName").value.trim(),
    department: $("courseDepartment").value,
    instructor: $("courseInstructor").value.trim(),
    credits: Number($("courseCredits").value),
    semester: $("courseSemester").value,
    prerequisite: $("coursePrerequisite").value.trim().toUpperCase() || "None",
    status: $("courseStatus").value
  };

  if (id) {
    courses = courses.map(item => item.id === id ? course : item);
    showToast("Course updated successfully.");
  } else {
    courses.unshift(course);
    showToast("Course added successfully.");
  }
  saveCourses();
  closeModal();
  renderCourses();
});

$("coursesTable").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const course = courses.find(item => item.id === button.dataset.id);
  if (!course) return;

  if (button.dataset.action === "edit") {
    openModal(course);
  } else if (button.dataset.action === "delete") {
    if (confirm(`Delete ${course.code} — ${course.name}? This cannot be undone.`)) {
      courses = courses.filter(item => item.id !== course.id);
      saveCourses();
      renderCourses();
      showToast("Course deleted.");
    }
  }
});

$("addCourseBtn").addEventListener("click", () => openModal());
$("closeModal").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);
$("courseModal").addEventListener("click", event => {
  if (event.target === $("courseModal")) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !$("courseModal").hidden) closeModal();
});
$("searchInput").addEventListener("input", renderCourses);
$("departmentFilter").addEventListener("change", renderCourses);
$("statusFilter").addEventListener("change", renderCourses);
$("resetBtn").addEventListener("click", () => {
  $("searchInput").value = "";
  $("departmentFilter").value = "";
  $("statusFilter").value = "";
  renderCourses();
});
$("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
$("today").textContent = new Date().toLocaleDateString("en-US", {weekday:"short", month:"short", day:"numeric", year:"numeric"});

renderCourses();
