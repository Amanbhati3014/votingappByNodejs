//we need to do for database
const mongoose = require("mongoose");
require('dotenv').config();
//define the mongodb connection URL

// const mongoURL = "mongodb://localhost:27017/hotels";
//  const mongoURL = 'mongodb+srv://amanbhati:aman12345@cluster0.msnfu8g.mongodb.net/';
 const mongoURL = process.env.mongoDB_URL_Local;
//  const mongoURL = process.env.mongoDB_URL;
//set up mongoddb connection
//ise check karna hai
mongoose.connect(mongoURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
//get the default connection
const db = mongoose.connection;

//add event listener
db.on('connected',() => {
  console.log("connected to mongoDB server");
})
db.on('error',(err) => {
  console.log("error");
})
db.on('disconnected',() => {
  console.log("disconnect mongodb server");
})

//export the db connection
module.exports = db;