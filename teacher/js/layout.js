// only logged-in teachers may open these pages
var session = null;
try { session = JSON.parse(sessionStorage.getItem("sis_user")); } catch (e) {}
if (!session || session.role !== "teacher") {
    window.location.replace(session ? ({ admin: "../../admin/index.html", student: "../../student/dashboard.html" })[session.role] : "../../auth/login.html");
}

// log out clears the session, then the link goes to the login page
var logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
    logoutLink.addEventListener("click", function () { sessionStorage.removeItem("sis_user"); });
}

// show today's date in the top bar
var today = document.getElementById("today");
if (today) {
    today.textContent = new Date().toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
}

// open and close the sidebar on small screens
var menuBtn = document.getElementById("menuBtn");
var sidebar = document.getElementById("sidebar");
if (menuBtn) {
    menuBtn.addEventListener("click", function () {
        sidebar.classList.toggle("open");
    });
}
