
const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    message: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    time: {
        type: String
    }
});
const Message = new mongoose.model("message", chatSchema);
module.exports = Message;

