
const mongoose= require("mongoose");
const chatSchema =new mongoose.Schema({
    name:{
        type:String,
        
    },
    message:{
       type:String,
       required:true
    }
});
const Message= new mongoose.model("message",chatSchema);
module.exports=Message;

