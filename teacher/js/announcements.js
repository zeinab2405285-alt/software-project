var message = document.getElementById("message");

function showMessage(text, type) {
    message.className = "box " + type;
    message.textContent = text;
    message.style.display = "block";
    window.scrollTo(0, 0);
}

document.getElementById("sendBtn").addEventListener("click", function () {
    var course = document.getElementById("course").value;
    var title = document.getElementById("title").value;
    var text = document.getElementById("text").value;

    // do not send an empty announcement
    if (title == "" || text == "") {
        showMessage("Please write a title and a message first", "error");
        return;
    }

    // build the new announcement
    var note = document.createElement("div");
    note.className = "note";

    var h3 = document.createElement("h3");
    h3.textContent = title;

    var p = document.createElement("p");
    p.textContent = text;

    var small = document.createElement("small");
    small.textContent = course + " - Today";

    note.appendChild(h3);
    note.appendChild(p);
    note.appendChild(small);

    // put it at the top of the list
    var list = document.getElementById("list");
    list.insertBefore(note, list.firstChild);

    // show the green message and clear the form
    showMessage("Announcement sent to " + course, "success");
    document.getElementById("title").value = "";
    document.getElementById("text").value = "";
    document.getElementById("deadline").value = "";
});
