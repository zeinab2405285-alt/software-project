var message = document.getElementById("message");

// show a green or red message at the top of the page
function showMessage(text, type) {
    message.className = "box " + type;
    message.textContent = text;
    message.style.display = "block";
    window.scrollTo(0, 0);
}

// Save changes button
document.getElementById("saveBtn").addEventListener("click", function () {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;

    if (name == "" || email == "") {
        showMessage("Name and email cannot be empty", "error");
        return;
    }
    if (!email.includes("@")) {
        showMessage("Please enter a valid email", "error");
        return;
    }

    showMessage("Profile saved successfully", "success");
});

// Change password button
document.getElementById("passBtn").addEventListener("click", function () {
    var oldPass = document.getElementById("oldPass").value;
    var newPass = document.getElementById("newPass").value;
    var confirmPass = document.getElementById("confirmPass").value;

    if (oldPass == "" || newPass == "") {
        showMessage("Please fill in all password boxes", "error");
    } else if (newPass.length < 8) {
        showMessage("New password must be at least 8 characters", "error");
    } else if (newPass != confirmPass) {
        showMessage("New password and confirm password do not match", "error");
    } else {
        showMessage("Password changed successfully", "success");
        document.getElementById("oldPass").value = "";
        document.getElementById("newPass").value = "";
        document.getElementById("confirmPass").value = "";
    }
});
