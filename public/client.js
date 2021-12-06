let socket = io();
let form = document.getElementById("form");
let input = document.getElementById("input");
let feedback = document.getElementById("feedback");
let username = document.getElementById("username");
let messages = document.getElementById('messages')
let online = document.getElementById('online');
let users = []
let selfId

// Color for the messages 
let colors = ['#0080FF', '#8000FF' , '#FF00FF' , '#FF0080','#FF0000','#FF8000','#80FF00','#00FF00','#00FF80']

let coll = document.getElementsByClassName("collapsible");

coll[0].addEventListener("click", function() {
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
    data.forEach((user) =>{
      user.color = colors[0]
      colors = colors.splice(1)
      addusertolist(user)
    })
    users = users.concat(data)
})

// Sent a chat message to server when submit a form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value ) {
    socket.emit("chat message", username.value, input.value);
    input.value = "";
  }
  if (username.readOnly === false) {
    username.readOnly = true;
    username.style.backgroundColor = "gold"
  }
});

// Received from server when someone gets connected
socket.on("connected", (id) => {

  users.push({ name:"Annonymus", id: id, color : colors[0] })
  addusertolist({ name: "Annonymus", id: id, color : colors[0]})
  colors = colors.splice(1)

  if(selfId){
    let item = document.createElement("li");
    item.className = 'connection'
    item.style.color = "black";
    item.textContent = "A user has connected";
    item.style.backgroundColor = "LightGray";
    messages.appendChild(item);
  }
  else{
    selfId = id
    feedback.innerHTML= "Welcome to Chat App - Instant Messaging App"
    playSound('/welcome.mp3')
  }

  scrollSmoothToBottom('main')
});

// Received from server when someone gets disconnected
socket.on("disconnected", (id) => {
  let current_user = users.filter((user)=> user.id === id)
  colors.push(current_user[0].color)
  users = users.filter((user) => user.id != id);

  let item = document.createElement("li");
  item.style.color = "black";
  item.className = 'connection'
  item.style.backgroundColor = "LightGray";
  item.textContent =  current_user[0].name + ' has disconnected'
  messages.appendChild(item);

  scrollSmoothToBottom('main')
  removeuserfromlist(id);
  feedback.innerHTML =''
});

// Recieved from a server when a chat message is received
socket.on("chat message", (user, msg) => {
  let item = document.createElement("li");
  item.className = user.id
  let current_user = users.filter((_user_)=> _user_.id === user.id)
  if(selfId === user.id){
    item.classList.add('self')
  }
  else{
    item.style.color = current_user[0].color
  }

  let currentTime = new Date()
  let currentHour = currentTime.getHours()
  let half = 'AM'
  if(currentHour > 12){
    currentHour = currentTime.getHours() - 12
    half = 'PM'
  }
  let currentMinute = currentTime.getMinutes()
  console.log(currentMinute)
  if(currentMinute < 10){
    currentMinute = `0${currentMinute}`
  }

  item.innerHTML = `<b> ${ user.name } &nbsp; </b> ( ${currentHour} : ${currentMinute}  ${half} ) <br>` + msg;
  item.classList.add('messages')
  messages.appendChild(item)

  scrollSmoothToBottom('main')
  if(user.id !== selfId ) playSound('/notification.mp3')
  feedback.innerHTML = "";

  // check if someone has set their name
  users.forEach((saved_user) => {
    if(saved_user.id === user.id) {
      saved_user.name = user.name
      let item = document.getElementById(user.id);
      item.textContent = user.name;
    }
  });
})

// Sent to server when you type
input.addEventListener("keypress", () => {
  socket.emit("typing",username.value);
});

//Received from server when someone else is typing
socket.on("typing", (user) => {
  feedback.innerHTML = user + " is typing...";
});

// Add user to collapsible
let addusertolist = (user) => {
  let item = document.createElement("li");
  item.style.color = (selfId) ? user.color : 'blue';
  item.textContent = user.name;
  item.id = user.id
  online.appendChild(item);
}

// Remove use from collapsible
let removeuserfromlist = (userid) => {
  let item = document.getElementById(userid);
  if(item != null)
    item.remove();
}

// Auto scroll to bottom when messages come
function scrollSmoothToBottom(id){
  var div = document.getElementById(id)
  var scrollHeight = div.scrollHeight
  div.scroll({
    top : scrollHeight + 10,
    behavior : "smooth"
  })
}

function playSound(url) {
  const audio = new Audio(url);
  audio.play();
}