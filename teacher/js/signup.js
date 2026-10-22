document.getElementById("signupBtn").addEventListener("click", function () {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var uid = document.getElementById("uid").value;
    var password = document.getElementById("password").value;
    var confirm = document.getElementById("confirm").value;
    var message = document.getElementById("message");

    // show a red message
    function showError(text) {
        message.className = "box error";
        message.textContent = text;
        message.style.display = "block";
    }

    if (name == "" || email == "" || uid == "" || password == "") {
        showError("Please fill in all the boxes");
    } else if (!email.includes("@")) {
        showError("Please enter a valid email");
    } else if (password.length < 8) {
        showError("Password must be at least 8 characters");
    } else if (password != confirm) {
        showError("Password and confirm password do not match");
    } else {
        // success: show a green message, then go to the login page
        message.className = "box success";
        message.textContent = "Account created. Waiting for admin approval. Going to log in...";
        message.style.display = "block";
        setTimeout(function () {
            window.location.href = "login.html";
        }, 2000);
    }
});
