const express = require("express");
const app = express();
const db = require("./db");
require('dotenv').config();

 const passport = require('passport');
 const LocalStrategy = require('passport-local').Strategy;

 const bodyParser = require("body-parser");
 app.use(bodyParser.json()); //req.body
 const PORT = process.env.PORT || 3000;



 //import the router files 
const userroutes = require('./routes/userroutes');
const candidateroutes = require('./routes/candidateroutes');
//use router 
// should be "function" (really an object with router methods)
app.use('/user', userroutes);
app.use('/candidate', candidateroutes);



 app.listen(PORT, () => {
	console.log("listening on port 3000");
});