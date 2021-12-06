let socket = io();
let form = document.getElementById("form");
let input = document.getElementById("input");
let feedback = document.getElementById("feedback");
let username = document.getElementById("username");
let messages = document.getElementById("messages");
let users = [];


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


// ask users online as soon as you connect
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

socket.on("connected", (id) => {
  users.push({ name:"", id: id});
  let item = document.createElement("li");
  item.style.color = "blue";
  item.textContent = "A user has connected";
  messages.appendChild(item);

  addusertolist({ name: "anonimus", id: id});
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
  window.scrollTo(0, document.body.scrollHeight);
  feedback.innerHTML = "";

  // check if someone has set their name
  users.forEach((saved_user) => {
    if(saved_user.id == user.id) {
      saved_user.name = user.name
      let item = document.getElementById(user.id);
      item.textContent = user.name;
    }
  });
});
socket.on("output",(result)=>{
  
  if(result.length)
  {
    for(var x=0;x<result.length;x++)
    {
      let item = document.createElement("li");
      item.innerHTML = `<b>${ result[x].name }: </b>` + result[x].message ;
      
      messages.appendChild(item);
    }
  }
})

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