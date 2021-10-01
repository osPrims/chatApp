const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("A user has connected");
  socket.broadcast.emit("con", "some user connected");
  socket.on("chat message", (msg) => {
    console.log("Message: ", msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
    io.emit("con", "some user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Listening on *:3000");
});
