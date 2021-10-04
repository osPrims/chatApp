let socket = io();
let form = document.getElementById("form");
let input = document.getElementById("input");
let feedback = document.getElementById("feedback");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

// Show 'A user has connected'
socket.on("con", (msg) => {
  let item = document.createElement("li");
  item.style.color = "blue";
  item.textContent = msg;
  messages.appendChild(item);
});

socket.on("chat message", (msg) => {
  let item = document.createElement("li");
  item.textContent = msg;
  messages.appendChild(item);
  feedback.innerHTML = "";
});

input.addEventListener("keypress", () => {
  socket.emit("typing");
});

socket.on("typing", () => {
  feedback.innerHTML = "A user is typing...";
});
