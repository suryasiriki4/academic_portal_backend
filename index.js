require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


//set up express

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, function() {
    console.log("the server started on 5000");
});

const uri = process.env.MONGODB_CONNECTION_STRING;

mongoose.connect(uri, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
}, (err) => {
        if(err) {
            console.log(err);
        } else {
            console.log("connection established with mongodb");
        }        
});

app.use("/users", require("./routes/userRouter"));
app.use("/todos", require("./routes/todoRouter"));