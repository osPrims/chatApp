const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
    name: {
      type: String,
    },
    message: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    time: {
      type: String,
    }
});

const Message = new mongoose.model("message", chatSchema);
module.exports = Message;