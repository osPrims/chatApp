const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Load external styles and scripts from folder 'public'
app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("A user has connected");
  socket.broadcast.emit("con", "A user has connected");
  socket.on("chat message", (msg) => {
    console.log("message: ", msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
    io.emit("con", "A user has disconnected");
  });
});

server.listen(3000, () => {
  console.log("Listening on *:3000");
});
