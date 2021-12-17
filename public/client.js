let socket = io();
let form = document.getElementById("form");
let input = document.getElementById("input");
let feedback = document.getElementById("feedback");
let username = document.getElementById("username");
let messages = document.getElementById('messages')
let online = document.getElementById('online');
let sendBtn = document.querySelector('.btn--send');
let users = []
let selfId
let md
let input_file = document.getElementById("input_file")
md = window.markdownit({
  html: false,
  linkify: true,
  typographer: true
});

// Color for the messages 
let colors = ['#0080FF', '#8000FF', '#FF00FF', '#FF0080', '#FF0000', '#FF8000', '#80FF00', '#00FF00', '#00FF80']

let coll = document.getElementsByClassName("collapsible");

coll[0].addEventListener("click", function () {
  this.classList.toggle("active");
  var content = this.nextElementSibling;
  if (content.style.display === "block") {
    content.style.display = "none";
  } else {
    content.style.display = "block";
  }
})


// Fetch users online as soon as you connect
fetch("/users")
  .then((user) => user.json())
  .then((data) => {
    data.forEach((user) => {
      user.color = colors[0]
      colors = colors.splice(1)
      addusertolist(user)
    })
    users = users.concat(data)
  })

// Sent a chat message to server when submit a form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", username.value, input.value);
    input.value = "";
  }
  const data = document.querySelector('input[type=file]').files[0];
  const reader = new FileReader();
  reader.onload = function(evt){
    var msg = {};

    msg.file = evt.target.result;
    msg.fileName = data.name;
    msg.username = username.value;
    socket.emit("base64_file",msg);
    //console.log(msg);
  };
  reader.readAsDataURL(data);
  
  if (username.readOnly === false) {
    username.readOnly = true;
    username.style.backgroundColor = "gold"
  }
});

// Received from server when someone gets connected
socket.on("connected", (id) => {

  users.push({ name: "Anonymous", id: id, color: colors[0] })
  addusertolist({ name: "Anonymous", id: id, color: colors[0] })
  colors = colors.splice(1)

  if (selfId) {
    let item = document.createElement("li");
    item.className = 'connection'
    item.style.color = "black";
    item.textContent = "A user has connected";
    item.style.backgroundColor = "LightGray";
    messages.appendChild(item);
  }
  else {
    selfId = id
    feedback.innerHTML = "Welcome to Chat App - Instant Messaging App"
    playSound('/welcome.mp3')
  }

  scrollSmoothToBottom('main')
});

// Received from server when someone gets disconnected
socket.on("disconnected", (id) => {
  let current_user = users.filter((user) => user.id === id)
  colors.push(current_user[0].color)
  users = users.filter((user) => user.id != id);

  let item = document.createElement("li");
  item.style.color = "black";
  item.className = 'connection'
  item.style.backgroundColor = "LightGray";
  item.textContent = current_user[0].name + ' has disconnected'
  messages.appendChild(item);

  scrollSmoothToBottom('main')
  removeuserfromlist(id);
  feedback.innerHTML = ''
});

// Recieved from a server when a chat message is received
socket.on("chat message", (user, msg) => {
  let item = document.createElement("li");
  item.className = user.id
  let current_user = users.filter((_user_) => _user_.id === user.id)
  if (selfId === user.id) {
    item.classList.add('self')
  }
  else {
    item.style.color = current_user[0].color
  }

  item.innerHTML = `<b>${user.name}&nbsp;</b><br>` + md.render(msg);
  item.classList.add('messages')
  messages.appendChild(item)

  scrollSmoothToBottom('main')
  if (user.id !== selfId) playSound('/notification.mp3')
  feedback.innerHTML = "";

  // check if someone has set their name
  users.forEach((saved_user) => {
    if (saved_user.id === user.id) {
      saved_user.name = user.name
      let item = document.getElementById(user.id);
      item.innerHTML = '<span class="dot"></span>' + user.name;
    }
  });
})

// Sent to server when you type
input.addEventListener("keypress", () => {
  socket.emit("typing", username.value);
});

//Received from server when someone else is typing
let fbTimer;
socket.on("typing", (user) => {
  clearTimeout(fbTimer);
  feedback.innerHTML = user + " is typing...";
  scrollSmoothToBottom('main');
  fbTimer = setTimeout(() => {
    feedback.innerHTML = "";
  }, 2000);
});

socket.on("base64_file", (data) => {

  var listitem = document.createElement('li');
  var curr_user_img = users.filter((_user_) => _user_.id === data.id);
  if (selfId === data.id) {
    listitem.classList.add('self')
  }
  else{
    listitem.style.color = current_user_img[0].color
  }
  listitem.innerHTML = `<p>${data.username}</p><img class="imgupload" src="${data.file}" height="200" width="200"/>`
  messages.appendChild(listitem);
  input_file.value = "";
  feedback.innerHTML = "";
  scrollSmoothToBottom('main')
  if (data.id !== selfId) playSound('/notification.mp3')
  users.forEach((saved_user) => {
    if (saved_user.id === data.id) {
      saved_user.name = data.username
      let item = document.getElementById(data.id);
      item.innerHTML = '<span class="dot"></span>' + user.name;
    }
  });
});
// Add user to collapsible
let addusertolist = (user) => {
  let item = document.createElement("li");
  item.style.color = (selfId) ? user.color : 'blue';
  item.innerHTML = '<span class="dot"></span>' + user.name;
  item.id = user.id
  item.onclick = handleOnlineClick.bind(null, user.id)
  online.appendChild(item);
}

// Remove use from collapsible
let removeuserfromlist = (userid) => {
  let item = document.getElementById(userid);
  if (item != null)
    item.remove();
}

// Auto scroll to bottom when messages come
function scrollSmoothToBottom(id) {
  var div = document.getElementById(id)
  var scrollHeight = div.scrollHeight
  div.scroll({
    top: scrollHeight + 10,
    behavior: "smooth"
  })
}

function playSound(url) {
  const audio = new Audio(url);
  audio.play();
}

function handleOnlineClick(id) {
  let current_user = users.filter((user) => user.id === id)
  input.value = `@${current_user[0].name}`
}

sendBtn.addEventListener('mousedown', () => {
  if (input.value || document.getElementById('input_file').value) {
    sendBtn.innerHTML = 'Sent &nbsp;<i class="fas fa-chevron-circle-right"></i>'
    sendBtn.style.backgroundColor = '#38b000'
  }
});

sendBtn.addEventListener('mouseup', () => {
  setTimeout(() => {
    sendBtn.innerHTML = 'Send <i class="fas fa-chevron-circle-right"></i>'
    sendBtn.style.backgroundColor = '#ed1c24'
  }, 400);
});

input.addEventListener("keyup", function (event) {
  if (event.key === 'Enter') {
    sendBtn.click();
    sendBtn.style.backgroundColor = '#38b000'
    setTimeout(() => {
      sendBtn.style.backgroundColor = '#ed1c24'
    }, 400);
  }
});

//serving images and video files
function readThenSend(){
  const data = document.querySelector('input[type=file]').files[0];
  const reader = new FileReader();
  reader.onload = function(evt){
    var msg = {};

    msg.file = evt.target.result;
    msg.fileName = data.name;
    msg.username = username.value;
    socket.emit("base64_file", msg);
    //console.log(msg);
  };
  reader.readAsDataURL(data);
};





