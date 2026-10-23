// hardcoded students for each course
var data = {
    CS220: [
        { id: "2406881", name: "Mariam Bakr", email: "mariam@uni.edu", attendance: "92%", total: 68 },
        { id: "2406112", name: "Ali Ahmed", email: "ali@uni.edu", attendance: "85%", total: 74 },
        { id: "2405540", name: "Zeinab Hany", email: "zeinab@uni.edu", attendance: "97%", total: 88 },
        { id: "2307321", name: "Omar Khaled", email: "omar@uni.edu", attendance: "70%", total: 52 }
    ],
    CS201: [
        { id: "2208019", name: "Nour Samy", email: "nour@uni.edu", attendance: "95%", total: 91 },
        { id: "2406881", name: "Mariam Bakr", email: "mariam@uni.edu", attendance: "90%", total: 80 },
        { id: "2504410", name: "Salma Tarek", email: "salma@uni.edu", attendance: "88%", total: 77 }
    ]
};

var courseSelect = document.getElementById("course");
var searchBox = document.getElementById("search");
var list = document.getElementById("list");
var count = document.getElementById("count");

// open the right course if the link has ?course=CS201
var params = new URLSearchParams(window.location.search);
if (params.get("course")) {
    courseSelect.value = params.get("course");
}

// build the table rows for the chosen course
function showStudents() {
    var students = data[courseSelect.value];
    var text = searchBox.value.toLowerCase();
    var html = "";
    var shown = 0;

    students.forEach(function (s) {
        var match = s.name.toLowerCase().includes(text) || s.id.includes(text);
        if (match) {
            var initials = s.name.split(" ").map(function (w) { return w[0]; }).join("");
            html += "<tr>";
            html += "<td>" + s.id + "</td>";
            html += "<td><div class='person'><div class='mini-avatar'>" + initials + "</div><strong>" + s.name + "</strong></div></td>";
            html += "<td>" + s.email + "</td>";
            html += "<td>" + s.attendance + "</td>";
            html += "<td>" + s.total + " / 100</td>";
            html += "</tr>";
            shown++;
        }
    });

    if (shown == 0) {
        html = "<tr><td colspan='5'><div class='empty-state'><strong>No students found</strong>Try a different name or ID.</div></td></tr>";
    }

    list.innerHTML = html;
    count.textContent = "Showing " + shown + " students";
}

// run when the page opens, when the course changes, and while typing
showStudents();
courseSelect.addEventListener("change", showStudents);
searchBox.addEventListener("input", showStudents);
