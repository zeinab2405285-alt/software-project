var message = document.getElementById("message");

// show a green or red message at the top
function showMessage(text, type) {
    message.className = "box " + type;
    message.textContent = text;
    message.style.display = "block";
    window.scrollTo(0, 0);
}

// get every row of the table
var rows = document.querySelectorAll("tr");

rows.forEach(function (row) {
    var inputs = row.querySelectorAll(".mark");

    inputs.forEach(function (input) {
        // runs every time the teacher types a mark
        input.addEventListener("input", function () {

            // no negative marks
            if (Number(input.value) < 0) {
                input.value = 0;
            }

            // no mark bigger than the maximum
            if (Number(input.value) > Number(input.max)) {
                input.value = input.max;
            }

            // remove the red border while the teacher fixes it
            input.classList.remove("invalid");

            // add the 3 marks of this student
            var sum = 0;
            inputs.forEach(function (i) {
                sum = sum + Number(i.value);
            });
            row.querySelector(".total").textContent = sum;
        });
    });
});

// when the teacher clicks Save, check every box first
document.getElementById("saveBtn").addEventListener("click", function () {
    var allInputs = document.querySelectorAll(".mark");
    var problems = 0;

    allInputs.forEach(function (input) {
        var value = input.value;
        var bad = false;

        if (value === "") {
            bad = true;                                  // empty box
        } else if (Number(value) < 0) {
            bad = true;                                  // negative
        } else if (Number(value) > Number(input.max)) {
            bad = true;                                  // too big
        }

        if (bad) {
            input.classList.add("invalid");
            problems++;
        } else {
            input.classList.remove("invalid");
        }
    });

    if (problems > 0) {
        showMessage("Please fix " + problems + " empty or wrong mark(s) before saving", "error");
    } else {
        showMessage("Grades saved successfully", "success");
    }
});
