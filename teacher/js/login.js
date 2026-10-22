document.getElementById("loginBtn").addEventListener("click", function () {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var message = document.getElementById("message");

    if (email == "" || password == "") {
        message.textContent = "Please enter your email and password";
        message.style.display = "block";
    } else if (!email.includes("@")) {
        message.textContent = "Please enter a valid email";
        message.style.display = "block";
    } else {
        // no real check in Phase 1, so we go straight to the dashboard
        window.location.href = "dashboard.html";
    }
});
