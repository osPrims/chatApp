const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
}).then(() => {
    console.log("MongoDB connected");
}).catch((e) => {
    console.log("MongoDB not connected");
    console.log(e);
})