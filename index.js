const mongoose = require("mongoose");

const session=require('express-session')

const morgan = require("morgan");
const errorHandler=require('./middleware/errorHandler')
const express = require("express");
const app = express();
const path = require("path");
const nocache = require("nocache");
const env=require('dotenv')
env.config()

mongoose.connect(process.env.mongo);

app.use(session({
  secret:process.env.secret,
  resave:false,
  saveUninitialized:true
}));




const publicPath = path.join(__dirname, "public");
app.use(nocache())
app.use(express.static(publicPath));
app.use(morgan('tiny'))
app.use(express.urlencoded({extended:true})) 
app.use(express.json())





// for userRoute

const userRoute = require("./routes/userRoute");
app.use("/", userRoute);


const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

app.use(errorHandler)

app.listen(process.env.port, (req, res) => {
  console.log("server is loading 3004");
});
