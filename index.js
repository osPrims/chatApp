// Usual Express and Socket.IO stuff
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 8080
let users = []; 
// Load external styles and scripts from folder 'public'
app.use(express.static("public"));

// Um
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/users", (req, res) => {
  res.send(users);
});

io.on("connection", (socket) => {
  console.log("A user has connected");
  socket.broadcast.emit("connected", socket.id);
  //let = current_user = { name: "", id: socket.id };
  socket.name ="";
  let filtered_users = users.filter((user) => user.id == socket.id);
  if(filtered_users != []) {
    users.push({
      name: "",
      id : socket.id
    });
  }
  socket.on("chat message", (user_name, msg) => {
    console.log(user_name + "(user): ", msg);
    socket.name = user_name;
    io.emit("chat message", {name:socket.name, id:socket.id} , msg);
    let current_user = users.filter((user) =>{ if(user.id == socket.id) {user.name = user_name} });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing");
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
    users = users.filter((user) => user.id != socket.id);
    io.emit("disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log("Listening on:", port);
});
