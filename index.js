// Usual Express and Socket.IO stuff
require("dotenv").config();
const express = require("express");
let favicon = require('serve-favicon');
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 8080
let users = []; 
require("./database/conn");
const Message=require("./database/registers");
const getmessages=async(socket)=>{
  const result=await Message.find().sort({_id:1});
  socket.emit("output",result);

}
const storemessage=async(user_name,msg)=>{
  const message=new Message ({name:user_name,
    message: msg});
  await message.save();}
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

io.on("connection", (socket) => {
  console.log("A user has connected");
  socket.broadcast.emit("connected", socket.id);
 getmessages(socket);
 
  socket.name ="";
  let filtered_users = users.filter((user) => user.id == socket.id);
  if (filtered_users != []) {
    users.push({
      name: "Annonimus",
      id: socket.id
    });
  }
  socket.on("chat message", (user_name, msg) => {
    console.log(user_name + "(user): ", msg);
    storemessage(user_name, msg);
    socket.name = user_name;
    io.emit("chat message", { name: socket.name, id: socket.id }, msg);
    let current_user = users.filter((user) => { if (user.id == socket.id) { user.name = user_name } });
  });

  socket.on("typing", (user) => {
    socket.broadcast.emit("typing", user);
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
