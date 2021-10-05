let socket = io();
let form = document.getElementById("form");
let input = document.getElementById("input");
let feedback = document.getElementById("feedback");
let username = document.getElementById("username");
let users = [];
fetch("/users")
.then((user) => user.json())
.then((data) => {
  users = data;
  users.forEach((user) => addusertolist(user));
});
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value) {
    socket.emit("chat message", username.value, input.value);
    input.value = "";
  }
  if (username.readOnly == false) {
    username.readOnly = true;
  }
  console.log(users);
});

// Show 'A user has connected'
// socket.on("con", (msg) => {
//   let item = document.createElement("li");
//   item.style.color = "blue";
//   item.textContent = msg;
//   messages.appendChild(item);

//   let result = await fetch("/users");
//   users = await result.json();
  //update online members
  // setTimeout(async() => {
  //   let item = document.createElement("li");
  //   item.style.color = "blue";
  //   item.textContent = users[0].name;
  //   online.appendChild(item);
  //   }, 1000);
// });
socket.on("connected", (id) => {
  users.push({ name:"", id: id});
  let item = document.createElement("li");
  item.style.color = "blue";
  item.textContent = "A user has connected";
  messages.appendChild(item);

  addusertolist({ name: "anonimus", id: id});
  // let user = document.createElement("li");
  // user.style.color = "blue";
  // user.textContent = "anonimus";
  // user.id = id;
  // online.appendChild(user);
});

socket.on("disconnected", (id) => {
  users = users.filter((user) => user.id != id);
  let item = document.createElement("li");
  item.style.color = "blue";
  item.textContent = "A user has disconnected";
  messages.appendChild(item);

  removeuserfromlist(id);
});

socket.on("chat message", (user, msg) => {
  let item = document.createElement("li");
  item.innerHTML = `<b>${ user.name }: </b>` + msg;
  messages.appendChild(item);
  feedback.innerHTML = "";

  users.forEach((saved_user) => {
    if(saved_user.id == user.id) {
      saved_user.name = user.name
      let item = document.getElementById(user.id);
      item.textContent = user.name;
    }
  });
});

input.addEventListener("keypress", () => {
  socket.emit("typing");
});

socket.on("typing", () => {
  feedback.innerHTML = "A user is typing...";
});

let addusertolist = (user) => {
  let item = document.createElement("li");
  item.style.color = "blue";
  item.textContent = user.name;
  item.id = user.id
  online.appendChild(item);
}

let removeuserfromlist = (userid) => {
  let item = document.getElementById(userid);
  if(item != null)
    item.remove();
}