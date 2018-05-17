require('./config/config');

//library imports
const _ = require('lodash');                    //Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc.
const express = require('express');             //Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
const bodyParser = require('body-parser');      //Parse incoming request bodies in a middleware before your handlers
const {ObjectID} = require('mongodb');          //Create a new ObjectID instance

//local imports
const {mongoose} = require('./db/mongoose');    //Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
const {Player} = require('./models/player');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();                          //stores the express application
const port = process.env.PORT                   //sets up local port or heroku port

app.use(bodyParser.json());                     //middleware - takes the body data sent from client json and convert it to an object attaching it on to the request object


module.exports = {app};
