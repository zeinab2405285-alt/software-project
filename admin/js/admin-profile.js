(function () {
    "use strict";

    let user = null;

    try {
        user = JSON.parse(sessionStorage.getItem("sis_user"));
    } catch (error) {
        user = null;
    }

    // Protect the admin profile page.
    if (!user || user.role !== "admin") {
        window.location.replace("../auth/login.html");
        return;
    }

    const $ = id => document.getElementById(id);

    const nameInput = $("name");
    const emailInput = $("email");
    const phoneInput = $("phone");
    const message = $("message");

    // Support common property names used by login systems.
    const getName = () =>
        user.name || user.fullName || user.username || "Administrator";

    nameInput.value = getName();
    emailInput.value = user.email || "";
    phoneInput.value = user.phone || "";

    $("sidebar-name").textContent = getName();

    function initials(name) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part[0])
            .join("")
            .toUpperCase() || "AD";
    }

    function updateAvatars(name) {
        const avatar = initials(name);
        $("sidebar-avatar").textContent = avatar;
        $("top-avatar").textContent = avatar;
    }

    updateAvatars(getName());

    $("today-label").textContent =
        new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date());

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "profile-message " + type;
        message.style.display = "block";
    }

    // Save profile details to this browser session.
    $("saveBtn").addEventListener("click", function () {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!name || !email) {
            showMessage(
                "Full name and email cannot be empty.",
                "error"
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage(
                "Please enter a valid email address.",
                "error"
            );
            return;
        }

        user.name = name;
        user.email = email;
        user.phone = phone;

        sessionStorage.setItem("sis_user", JSON.stringify(user));

        $("sidebar-name").textContent = name;
        updateAvatars(name);

        showMessage(
            "Profile updated for this session.",
            "success"
        );
    });

    // Validate the password form.
    // Actual password changes require backend authentication.
    $("passBtn").addEventListener("click", function () {
        const oldPass = $("oldPass").value;
        const newPass = $("newPass").value;
        const confirmPass = $("confirmPass").value;

        if (!oldPass || !newPass || !confirmPass) {
            showMessage(
                "Please fill in all password fields.",
                "error"
            );
            return;
        }

        if (newPass.length < 8) {
            showMessage(
                "New password must be at least 8 characters.",
                "error"
            );
            return;
        }

        if (newPass !== confirmPass) {
            showMessage(
                "The new passwords do not match.",
                "error"
            );
            return;
        }

        showMessage(
            "Password form validated. Connect a backend to securely change your password.",
            "success"
        );

        $("oldPass").value = "";
        $("newPass").value = "";
        $("confirmPass").value = "";
    });

    // Mobile sidebar.
    $("menu-toggle").addEventListener("click", function () {
        $("sidebar").classList.toggle("open");
    });

    // Logout.
    $("logout-btn").addEventListener("click", function () {
        sessionStorage.removeItem("sis_user");
        window.location.href = "../auth/login.html";
    });
})();