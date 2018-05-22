const express = require('express');                                   //Express -> popular Node.js framework that has a lot of features for web and mobile applications.
const app = express();                                                //stores the express application

const mongoose = require('mongoose');                                 //Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
mongoose.connect('mongodb://localhost:27017/PingPong');

const UserController = require('./controllers/user');                 //Connect to user routes
app.use('/api', UserController)

const PlayerController = require('./controllers/player');             //Connect to player routes
app.use('/api/players', PlayerController)

app.listen(3000, () => {                                              //run node src/server.js to interact with API
  console.log("started port");
})

module.exports = app
