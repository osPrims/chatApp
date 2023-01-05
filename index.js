// Usual Express and Socket.IO stuff
require("dotenv").config();
require("./database/conn");
const bcrypt = require("bcrypt");
const express = require("express");
let favicon = require("serve-favicon");
const app = express();
const http = require("http");
const cookieParser = require("cookie-parser");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { requireauth } = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const Message = require("./database/registers");
const User = require("./database/signupschema");

const { timeEnd } = require("console");
const nodemailer = require("nodemailer");

// Load external styles and scripts from folder 'public'
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

/******************************************************************************************/

const port = process.env.PORT || 8080;
const expirationTime = 3 * 24 * 60 * 60; // equivalent to 3 days
let users = [];
let err1 = { email: "", password: "" };
let userEntered;
let userEmail;
let user1;

// Get messages
const getMessages = async (socket) => {
  const result = await Message.find().sort({ _id: 1 });
  socket.emit("output", { result: result, useremail: userEmail });
};

// Store messages
const storeMessage = async (userName, msg, mail, time) => {
  const message = new Message({
    name: userName,
    message: msg,
    email: mail,
    time: time,
  });
  await message.save();
};

// Handle errors
const handlError = (err) => {
  let errors = { email: "", password: "" };

  if (err.code === 11000) {
    errors.email = "Email already exists";
    return errors;
  }
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

// Create token for user
const createToken = (id) => {
  return jwt.sign({ id }, "ankitgarg", {
    expiresIn: expirationTime,
  });
};

// Check if user has been created
const checkUser = (req, res, next) => {
  const token = req.cookies.login;
  if (token) {
    jwt.verify(token, "ankitgarg", async (err, decodedToken) => {
      if (err) {
        user1 = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        user1 = user;
        next();
      }
    });
  } else {
    user1 = null;
    next();
  }
};

/*******************************************************************************************/

// To serve favicon
app.use(favicon(__dirname + "/public/img/favicon.ico"));

// Serve the main file
app.get("*", checkUser);
app.get("/", requireauth, (req, res) => {
  userEntered = user1.username;
  userEmail = user1.email;
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/ui", requireauth, (req, res) => {
  userEntered = user1.username;
  userEmail = user1.email;
  res.sendFile(__dirname + "/tmp/old.index.html");
});

// Handling signup
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/views/signup.html");
});

// Handling sign post request
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
      throw "Password does not match";
    }
  } catch (err) {
    if (err != "Password does not match") {
      err1 = handlError(err);
    }
    if (err == "Password does not match" && err1.password == "") {
      if (err1.email != "Email already exists") {
        err1.password = "Password does not match";
      }
    }

    let error = { ...err1 };
    err1.password = "";
    err1.email = "";
    res.status(400).json({ error });
  }
});

// Handling login

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw "Invalid Email";
    }
    if (user) {
      const auth = await bcrypt.compare(req.body.password, user.password);
      if (auth) {
        const token = createToken(user._id);
        res.cookie("login", token, { httpOnly: true, expirationTime: expirationTime * 1000 });
        res.status(200).json({ user: user._id });
      } else {
        throw Error("Incorrect Password");
      }
    }
  } catch (err) {
    if (err == "Invalid Email") {
      err1.email = "Email not registered";
    } else {
      err1.password = "Incorrect Password";
    }

    let error = { ...err1 };
    err1.password = "";
    err1.email = "";
    console.log(error);
    res.status(400).json({ error });
  }
});

// Handling forgetting password
// Create OTP
app.post("/otp", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw "Invalid Email";
    } else {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: "Gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      let otp = parseInt(Math.random() * 1000000);

      // Send mail with defined transport object
      let mailOptions = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "Reset Password OTP | ChatApp",
        text: `Hello user,\nYour OTP is : ${otp}\nEnter this code within 1 hour to login to your account if you have forgotten your password or go to the login page to resend it. If you do not recognize or expect this mail, please do not share the above OTP with anyone.\n\nchatApp`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        } else {
          console.log("done");
        }
      });

      res.json({ otp });
    }
  } catch (err) {
    let error = { email: "" };
    if (err === "Invalid Email") {
      error.email = "Invalid Email";
    }

    res.status(400).json({ error });
  }
});

app.get("/forgotpassword", (req, res) => {
  res.sendFile(__dirname + "/views/fpassword.html");
});

app.post("/forgotpassword", async (req, res) => {
  try {
    console.log(req.body.otp, parseInt(req.body.userotp));
    if (req.body.otp != parseInt(req.body.userotp)) {
      throw "Invalid Otp";
    } else {
      console.log("No error");
      if (req.body.password === req.body.conpassword) {
        if (req.body.password.length >= 6) {
          const salt = await bcrypt.genSalt();
          let password = await bcrypt.hash(req.body.password, salt);
          const user = await User.updateOne(
            { email: req.body.email },
            { $set: { password: password } }
          );
          res.status(201).json({ user: user._id });
        } else {
          throw "Minimum length should be 6 character";
        }
      } else {
        throw "Password does not match";
      }
    }
  } catch (err) {
    let error = { password: "", otpmessage: "" };
    if (err === "Invalid Otp") {
      error.otpmessage = "Invalid Otp";
    } else if (err === "Password does not match") {
      error.password = "Password does not match";
    } else if (err === "Minimum length should be 6 character") {
      error.password = "Minimum length should be 6 character";
    }
    res.status(400).json({ error });
  }
});

// Serve list of users
app.get("/users", (req, res) => {
  res.send(users);
});

app.get("/me", (req, res) => {
  res.send(user1);
});

app.get("/messages", async (req, res) => {
  const result = await Message.find();
  res.send(result);
});

app.get("/logout", (req, res) => {
  res.cookie("login", "", { expirationTime: 1 });
  res.redirect("/login");
});

/***************************************************************************************************** */

// When a connection is received
io.on("connection", (socket) => {
  if (user1) {
    io.emit("connected", {
      id: socket.id,
      name: userEntered,
      email: userEmail,
    });
    getMessages(socket);

    socket.name = "";
    let filteredUsers = users.filter((user) => user.id == socket.id);
    if (filteredUsers != []) {
      users.push({
        name: userEntered,
        id: socket.id,
        email: userEmail,
      });
    }

    // Receiving a chat message from client
    socket.on("mychat message", (msg, time) => {
      let currentUser = users.filter((user) => user.id === socket.id);
      const mail = currentUser[0].email;
      const name = currentUser[0].name;
      socket.name = name;

      let userList = [];
      if (msg.substr(0, 3) == "/w ") {
        msg = msg.substr(3);
        const idx = msg.indexOf(" ");
        if (idx != -1) {
          const toUsername = msg.substr(0, idx);
          msg = msg.substr(idx + 1);
          userList = users.filter((_user_) => _user_.name === toUsername);
        }
      }

      if (userList.length)
        userList.forEach((user) =>
          io
            .to(socket.id)
            .to(user.id)
            .emit(
              "chat message",
              { name: socket.name, id: socket.id },
              msg,
              time,
              user
            )
        ); 
        else
        io.emit(
          "chat message",
          { name: socket.name, id: socket.id },
          msg,
          time,
          "null"
        );

      storeMessage(name, msg, mail, time);
    });

    // Received when user is typing
    socket.on("typing", (user) => {
      socket.broadcast.emit("typing", user);
    });

    // Receiving an image file from user
    socket.on("base64_file", function (msg, time) {
      let currentUser = users.filter((user) => user.id === socket.id);
      const name = currentUser[0].name;
      socket.name = name;
      let data = {};
      data.fileName = msg.fileName;
      data.file = msg.file;
      data.id = socket.id;
      data.username = socket.name == "" ? "Anonymous" : socket.name;
      io.sockets.emit("base64_file", data, time);
    });

    // Sent to all clients when a socket is disconnected
    socket.on("disconnect", () => {
      users = users.filter((user) => user.id !== socket.id);
      io.emit("disconnected", socket.id);
    });
  }
});

server.listen(port, () => {
  console.log("Listening on:", port);
});