var message = document.getElementById("message");

function showMessage(text, type) {
    message.className = "box " + type;
    message.textContent = text;
    message.style.display = "block";
    window.scrollTo(0, 0);
}

document.getElementById("saveBtn").addEventListener("click", function () {
    var date = document.getElementById("date");

    // the teacher must choose a date first
    if (date.value === "") {
        date.classList.add("invalid");
        showMessage("Please choose the lecture date before saving", "error");
        return;
    }
    date.classList.remove("invalid");

    // get all the status dropdowns
    var statuses = document.querySelectorAll(".status-select");
    var present = 0;
    var late = 0;
    var absent = 0;

    // count each status
    statuses.forEach(function (s) {
        if (s.value == "Present") { present++; }
        if (s.value == "Late") { late++; }
        if (s.value == "Absent") { absent++; }
    });

    showMessage("Attendance saved. Present: " + present + ", Late: " + late + ", Absent: " + absent, "success");
});
