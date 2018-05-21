//library imports
const express = require('express');             //Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
const app = express();                          //stores the express application

const mongoose = require('mongoose');    //Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
mongoose.connect('mongodb://localhost:27017/PingPong');

const UserController = require('./controllers/user');
app.use('/api', UserController)

const PlayerController = require('./controllers/player');
app.use('/api/players', PlayerController)

app.listen(3000, () => {
  console.log("started port");
})

module.exports = app
