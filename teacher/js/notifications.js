var count = document.getElementById("count");

// show how many notifications are unread
function updateCount() {
    var unread = document.querySelectorAll(".unread").length;
    count.textContent = "You have " + unread + " unread notifications";
}

updateCount();

// remove the "unread" style from all notifications
document.getElementById("readBtn").addEventListener("click", function () {
    var items = document.querySelectorAll(".unread");
    items.forEach(function (item) {
        item.classList.remove("unread");
    });
    updateCount();
});
