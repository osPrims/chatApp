const mongoose=require("mongoose");

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true
}).then(()=>{
    console.log("connected");
}).catch((e)=>
{
    console.log("not connected");
    console.log(e);
})
