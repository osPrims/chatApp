let socket = io();
let form = document.getElementById("form");
let input = document.getElementById("input");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});
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
});
