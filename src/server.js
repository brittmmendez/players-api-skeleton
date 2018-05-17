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

// CREATE USER
app.post('/api/user', (req, res) => {
  let passwordConf =req.body.passwordConf
  let body = _.pick(req.body, ['first_name', 'last_name', 'email', 'password']);

  if (body.password !== passwordConf) {                //confirm password
    return res.status(400).send('Error: Password and confirmation password must match');
  }

  let user = new User(body);
  user.save().then(() => {
    return user.generateAuthToken();                       //call the method to geenrate token
  }).then((token) => {
    res.header('x-auth', token).send(user);               //send the token back as an http header. x-auth is a custom header for our specific purpose.
  }).catch((e) => {
    res.status(400).send(e);
  })
});

// GET /users/:id
app.get('/api/users/:id', authenticate, (req, res) => {   //runs middleware authencate and sends response below if no errors
  res.send(req.user);                                     //sending the user the request with the info we found/set in findByToken
});

module.exports = {app};
