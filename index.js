// Usual Express and Socket.IO stuff
const express = require("express");
let favicon = require('serve-favicon');
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 8080
const moment = require("moment");
let users = [];
let time = moment().format("h:mm a");
// Load external styles and scripts from folder 'public'
app.use(express.static("public"));

//to serve favicon
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// Serve the main file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Serve list of users 
app.get("/users", (req, res) => {
  res.send(users);
});

// When a connection is received
io.on("connection", (socket) => {
  console.log("A user has connected");

  // Emiting to all clients a user has connected
  io.emit("connected", socket.id)

  socket.name = ""
  let filtered_user = users.filter((user) => user.id === socket.id)
  if (!filtered_user.length) {
    users.push({
      name: "Anonymous",
      id: socket.id
    });
  }

  // Receiving a chat message from client
  socket.on("chat message", (user_name, msg) => {
    console.log('Received a chat message')
    console.log(user_name + "(user): ", msg);
    socket.name = user_name;
    io.emit("chat message", { name: socket.name, id: socket.id }, msg, time);
    let current_user = users.filter((user) => user.id === socket.id);
    current_user[0].name = user_name
  });

  // Received when some client is typing
  socket.on("typing", (user) => {
    socket.broadcast.emit("typing", user);
  });

  // Sent to all clients when a socket is disconnected
  socket.on("disconnect", () => {
    console.log("A user has disconnected");
    users = users.filter((user) => user.id !== socket.id);
    io.emit("disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log("Listening on:", port);
});
