// Usual Express and Socket.IO stuff
require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
let favicon = require("serve-favicon");
const app = express();
const http = require("http");
const cookieParser = require("cookie-parser");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
require("./database/conn");
const { requireauth } = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const Message = require("./database/registers");
const User = require("./database/signupschema");

const moment = require("moment");

// Load external styles and scripts from folder 'public'
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
/******************************************************************************************/
const port = process.env.PORT || 8080;
let users = [];
let err1 = { email: "", password: "" };
let userentered;
let useremail;
let user1;
/****************************************************************************************/
const getmessages = async (socket) => {
  const result = await Message.find().sort({ _id: 1 });
  socket.emit("output", { result: result, useremail: useremail });
};
const storemessage = async (user_name, msg, mail, time) => {
  const message = new Message({ name: user_name, message: msg, email: mail, time: time });
  await message.save();
};

const handlerror = (err) => {
  let errors = { email: "", password: "" };

  if (err.code === 11000) {
    errors.email = "email already exist";
    return errors;
  }
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};
const maxAge = 3 * 24 * 60 * 60;
const createtoken = (id) => {
  return jwt.sign({ id }, "ankitgarg", {
    expiresIn: maxAge
  });
};


const checkuser = (req, res, next) => {
  const token = req.cookies.login;
  if (token) {
    jwt.verify(token, "ankitgarg", async (err, decodedToken) => {
      if (err) {

        user1 = null;
        next();
      }
      else {
        console.log(decodedToken);
        let user = await User.findById(decodedToken.id);
        console.log(user);
        user1 = user;
        next();
      }
    }
    )
  }
  else {
    user1 = null;
    next();
  }
};
/****************************************************************************************** */

//to serve favicon
app.use(favicon(__dirname + "/public/img/favicon.ico"));

// Serve the main file
app.get("*", checkuser);
app.get("/", requireauth, (req, res) => {
  userentered = user1.username;
  useremail = user1.email;
  res.sendFile(__dirname + "/index.html");
});


//handling signup
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});



//handling sign post request
app.post("/signup", async (req, res) => {
  try {

    if (req.body.password === req.body.conpassword) {

      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
      await user.save();

      res.status(201).json({ user: user._id });

    } else {
      throw "Password does not matches";
    }
  } catch (err) {

    if (err != "Password does not matches") {
      err1 = handlerror(err);
    }
    if (err == "Password does not matches" && err1.password == "") {
      if (err1.email != "email already exist") {

        err1.password = "Password does not matches";
      }
    }

    console.log(err1);
    let error = { ...err1 };
    err1.password = "";
    err1.email = "";
    res.status(400).json({ error });
  }
});


//handling login
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log(user);
    if (!user) {
      console.log("inside error block")
      throw "Invalid Email";
    }


    if (user) {

      const auth = await bcrypt.compare(req.body.password, user.password)

      if (auth) {
        const token = createtoken(user._id);
        res.cookie("login", token, { httpOnly: true, maxAge: maxAge * 1000 });

        res.status(200).json({ user: user._id });
      }
      else {

        throw Error("Incorrent password");
      }
    }
  }
  catch (err) {

    if (err == "Invalid Email") {
      err1.email = "Email not registered";

    }
    else {

      err1.password = "Incorrect password"
    }



    let error = { ...err1 };
    err1.password = ""
    err1.email = ""
    console.log(error);
    res.status(400).json({ error });
  }
});

// Serve list of users
app.get("/users", (req, res) => {
  res.send(users);
});
app.get("/logout",(req,res)=>{
  res.cookie("login","",{maxAge:1})
  res.redirect("/login");
})
/***************************************************************************************************** */

// When a connection is received
io.on("connection", (socket) => {
  console.log("A user has connected");
  io.emit("connected", { id: socket.id, name: userentered });
  getmessages(socket);

  socket.name = "";
  let filtered_users = users.filter((user) => user.id == socket.id);
  if (filtered_users != []) {
    users.push({
      name: userentered,
      id: socket.id,
      email: useremail
    });
  }

  // Receiving a chat message from client
  socket.on("chat message", (msg) => {
    console.log("Received a chat message");
    let time = moment().utcOffset("+05:30").format('hh:mm A');
    let current_user = users.filter((user) => user.id === socket.id);
    const mail = current_user[0].email
    const name = current_user[0].name
    socket.name = name;

    let userList = [];
    if (msg.substr(0, 3) == "/w ") {
      msg = msg.substr(3);
      const idx = msg.indexOf(' ');

      if (idx != -1) {
        const toUsername = msg.substr(0, idx);
        msg = msg.substr(idx + 1);
        userList = users.filter((_user_) => _user_.name === toUsername);
      }
    }

    if (userList.length) userList.forEach(user => io.to(socket.id).to(user.id).emit("chat message", { name: socket.name, id: socket.id }, msg, time, user));
    else io.emit("chat message", { name: socket.name, id: socket.id }, msg, time, "null");

    storemessage(name, msg, mail, time);



  });

  // Received when some client is typing
  socket.on("typing", (user) => {
    socket.broadcast.emit("typing", user);
  });
  socket.on("base64_file", function (msg) {
    
    //console.log(msg.filename);
    //socket.broadcast.emit('base64 image', //exclude sender
    socket.username = msg.username
    console.log('received base64 file from' + ' ' + socket.username);
    io.sockets.emit("base64_file",  //include sender

      {
        username: socket.username=='' ? 'Anonymouse' : socket.username,
        file: msg.file,
        fileName: msg.fileName,
        id : socket.id
        
      }


    );
    let current_user = users.filter((user) => user.id === socket.id);
    current_user[0].name = socket.username
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
