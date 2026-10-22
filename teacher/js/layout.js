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
