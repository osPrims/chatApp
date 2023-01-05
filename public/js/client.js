let socket = io();
let form = document.getElementById("form");
let input = document.getElementById("input");
let feedback = document.getElementById("feedback");
let username = document.getElementById("username");
let messages = document.getElementById("messages");
let online = document.getElementById("online");
let sendBtn = document.querySelector(".btn--send");
let list = document.querySelector("#messages");
let inputFile = document.getElementById("input_file");
let searchBar = document.getElementById("search-messages");
let searchBarInput = document.getElementById("search-messages").querySelector("input");
let users = [];
let selfId;
let selfMail;
let md;
let myId;

// Color for the messages
let colors = [
  "#0080FF",
  "#8000FF",
  "#FF00FF",
  "#FF0080",
  "#FF0000",
  "#FF8000",
  "#80FF00",
  "#00FF00",
  "#00FF80",
];

// Markdown for the messages
md = window.markdownit({
  html: false,
  xhtmlOut: false,
  linkify: true,
  typographer: true,
  breaks: true,
});

// Fetch user
fetch("/me")
  .then((user) => user.json())
  .then((data) => {
    document.getElementById("username_holder").innerText = data.username;
    document.getElementById("email_holder").innerText = `<${data.email}>`;
    myId = data;
  });


// Add user to collapsible
let addUserToList = (user) => {
  let item = document.createElement("li");
  item.className = "clearfix";
  item.innerHTML = '<div class="about"><div class="name">' + user.name + "</div></div>";
  item.id = user.id;
  item.onclick = handleOnlineClick.bind(null, user.id);
  online.appendChild(item);
};

// Fetch users online as soon as you connect
fetch("/users")
  .then((user) => user.json())
  .then((data) => {
    data.forEach((user) => {
      user.color = colors[0];
      colors = colors.splice(1);
      addUserToList(user);
    });
    users = users.concat(data);
  });

// Send a chat message to server when submitting the form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("mychat message", input.value, getTime());
    input.value = "";
  }
});

// Received from server when someone gets connected
socket.on("connected", ({ id, name, email }) => {
  // Update user's (socket) id when reconnected
  if (selfMail === email) {
    const userIdx = users.findIndex((u) => u.email === email);
    users[userIdx].id = id;
    selfId = id;
    return;
  } 

  if (selfId) {
    let item = document.createElement("li");
    item.className = "connection p-2 rounded";
    item.style.color = "black";
    item.textContent = ` ${name} has connected`;
    item.style.backgroundColor = "LightGray";
    messages.appendChild(item);
  } else {
    // Set user id and email when connected for first time
    selfId = id;
    selfMail = email;
    feedback.innerHTML = "Welcome to Chat App - Instant Messaging App";
  }

  users.push({ name, id, email, color: colors[0] });
  addUserToList({ name, id, email, color: colors[0] });
  colors = colors.splice(1);

  scrollSmoothToBottom("main");
});

// Received from server when someone gets disconnected
socket.on("disconnected", (id) => {
  let currentUser = users.filter((user) => user.id === id);
  colors.push(currentUser[0].color);
  users = users.filter((user) => user.id != id);

  let item = document.createElement("li");
  item.style.color = "black";
  item.className = "connection p-2";
  item.style.backgroundColor = "LightGray";
  item.textContent = currentUser[0].name + " has disconnected";
  messages.appendChild(item);

  scrollSmoothToBottom("main");
  removeUserFromList(id);
  feedback.innerHTML = "";
});

// Recieved from a server when a chat message is received
socket.on("chat message", (user, msg, time, toUser) => {
  let item = document.createElement("li");
  item.className = user.id + " clearfix position-relative";

  let currentUser = users.filter((_user_) => _user_.id === user.id);
  if (selfId === user.id) {
    item.innerHTML = `<div class="message other-message bg-custom text-white ls-msg float-right p-3 wordwrap"> <span class="pb-2 fw-bold">${
      user.name
    }</span><br>${md.render(
      msg
    )}</div><span class="text-muted position-absolute bottom--10 end-0 fs-6">${time} </span>`;
  } else {
    item.innerHTML = `<div class="message my-message ls-msg p-3 wordwrap"><span class="pb-2 fw-bold">${
      user.name
    }</span><br>${md.render(
      msg
    )}</div><span class="text-muted position-absolute bottom--10 start-0 fs-6">${time} </span>`;
  }

  messages.appendChild(item);

  scrollSmoothToBottom("main");
  if (user.id !== selfId) feedback.innerHTML = "";

  // Check if someone has set their name
  users.forEach((savedUser) => {
    if (savedUser.id === user.id) {
      savedUser.name = user.name;
      let item = document.getElementById(user.id);
      item.innerHTML = `<div class="about">${user.name}</div>`;
    }
  });
});

// Fetch messages after logging in
socket.on("output", ({ result, useremail }) => {
  if (result.length) {
    for (let x = 0; x < result.length; x++) {
      let item = document.createElement("li");
      item.className = "clearfix position-relative";

      if (result[x].email == useremail) {
        item.innerHTML = `<div class="message other-message bg-custom text-white ls-msg float-right p-3 wordwrap"><span class="pb-2 fw-bold">${
          result[x].name
        }</span><br>${md.render(
          result[x].message
        )}</div><span class="text-muted position-absolute bottom--10 end-0 fs-6">${
          result[x].time
        } </span>`;
      } else {
        item.innerHTML = `<div class="message my-message ls-msg p-3 wordwrap"><span class="pb-2 fw-bold">${
          result[x].name
        }</span><br>${md.render(
          result[x].message
        )}</div><span class="text-muted position-absolute bottom--10 start-0 fs-6">${
          result[x].time
        } </span>`;
      }
      messages.appendChild(item);
    }
  }
  scroll("main");
});

// Scroll to bottom
function scroll(id) {
  let div = document.getElementById(id);
  let scrollHeight = div.scrollHeight;
  div.scroll({
    top: scrollHeight + 10,
  });
}

// Sent to server when you type
input.addEventListener("keypress", () => {
  socket.emit("typing", myId.username);
});

//Received from server when someone else is typing
socket.on("typing", (user) => {
  let fbTimer;
  clearTimeout(fbTimer);
  feedback.innerHTML = user + " is typing...";
  fbTimer = setTimeout(() => {
    feedback.innerHTML = "";
  }, 2000);
});

// Recieved from server when an image file is received
socket.on("base64_file", (data, time) => {
  let listItem = document.createElement("li");
  listItem.className = "clearfix position-relative";
  let currUserImg = users.filter((_user_) => _user_.id === data.id);
  if (selfId === data.id) {
    listItem.innerHTML = `<div class = "message other-message bg-custom text-white ls-msg float-right p-3 wordwrap"><span class = "pb-2 fw-bold"><b>${data.username}&nbsp;</b><br><img  src="${data.file}" height="200" width="200"/></div></span><span class = "text-muted position-absolute bottom--10 end-0 fs-6">${time} </span>`;
    inputFile.value = "";
  } else {
    listItem.innerHTML = `<div class = "message my-message ls-msg p-3 wordwrap"><span class = "pb-2 fw-bold"><b>${data.username}&nbsp;</b><br><img  src="${data.file}" height="200" width="200"/></div></span><span class="text-muted position-absolute bottom--10 start-0 fs-6">${time} </span>`;
  }

  messages.appendChild(listItem);
  if (data.id !== selfId) feedback.innerHTML = "";

  scrollSmoothToBottom("main");
});

// Remove user from collapsible
let removeUserFromList = (userId) => {
  let item = document.getElementById(userId);
  if (item != null) item.remove();
};

// Smooth scroll to bottom
function scrollSmoothToBottom(id) {
  let div = document.getElementById(id);
  let scrollHeight = div.scrollHeight;
  div.scroll({
    top: scrollHeight + 10,
    behavior: "smooth",
  });
}

// Mention user 
function handleOnlineClick(id) {
  let currentUser = users.filter((user) => user.id === id);
  input.value = `@${currentUser[0].name}`;
}

// Search for a phrase in messages
searchBar.addEventListener("submit", function (event) {
    event.preventDefault();
  });

searchBarInput.addEventListener("keyup", (e) => {
  e.preventDefault();
  const term = e.target.value.toLowerCase();
  const messageList = messages.getElementsByClassName("ls-msg");
  Array.from(messageList).forEach((msgList) => {
    const title = msgList.textContent;
    if (title.toLowerCase().indexOf(e.target.value) !== -1) {
      msgList.parentNode.style.display = "block";
    } else {
      msgList.parentNode.style.display = "none";
    }
  });
});

// Animate send button when clicking
sendBtn.addEventListener("mousedown", () => {
  if (input.value || inputFile.value) {
    sendBtn.innerHTML =
      'Sent &nbsp;<i class="fas fa-chevron-circle-right"></i>';
    sendBtn.style.backgroundColor = "#38b000";
  }
});

// Animate send button after clicking
sendBtn.addEventListener("mouseup", () => {
  setTimeout(() => {
    sendBtn.innerHTML = 'Send <i class="fas fa-chevron-circle-right"></i>';
    sendBtn.style.backgroundColor = "#ed1c24";
  }, 400);
});

// Animate send button after pressing enter key
input.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    sendBtn.click();
    sendBtn.style.backgroundColor = "#38b000";
    setTimeout(() => {
      sendBtn.style.backgroundColor = "#ed1c24";
    }, 400);
  }
});

// Sent to server when an image file is uploaded
function readThenSend() {
  const data = document.querySelector("input[type=file]").files[0];
  const reader = new FileReader();
  reader.onload = function (evt) {
    let msg = {};
    msg.username = socket.name;
    msg.file = evt.target.result;
    msg.fileName = data.fileName;
    socket.emit("base64_file", msg, getTime());
  };
  reader.readAsDataURL(data);
}

// Sent to server current location
function sendPosition(position) {
  let centerCoordinates = new google.maps.LatLng(37.6, -95.665);
  let defaultOptions = { center: centerCoordinates, zoom: 4 };
  let mapLayer = document.createElement("div");

  let map = new google.maps.Map(mapLayer, defaultOptions);
  let currentLatitude = position.coords.latitude;
  let currentLongitude = position.coords.longitude;

  let infoWindowHTML =
    "Latitude: " + currentLatitude + "<br>Longitude: " + currentLongitude;
  let infoWindow = new google.maps.InfoWindow({
    map: map,
    content: infoWindowHTML,
  });
  let currentLocation = { lat: currentLatitude, lng: currentLongitude };
  infoWindow.setPosition(currentLocation);
  socket.emit("location_Send", infoWindow);
}

function sendLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendPosition);
  }
}

// Get current time
function getTime() {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let meridian = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes + " " + meridian;
  return strTime;
}