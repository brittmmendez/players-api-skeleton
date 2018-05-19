//library imports
const _ = require('lodash');                    //Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc.
const express = require('express');             //Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
const bodyParser = require('body-parser');      //Parse incoming request bodies in a middleware before your handlers
const {ObjectID} = require('mongodb');          //Create a new ObjectID instance

const mongoose = require('mongoose');    //Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
mongoose.promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/PingPong');

//local imports
const {Player} = require('./models/player');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');


const app = express();                          //stores the express application

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

// USER LOGIN
app.post('/api/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {    //call to veryfy if  user exsists with that email. check password
    user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);               //send the token back as an http header. x-auth is a custom header for our specific purpose.
    });
  }).catch((e) =>{
    res.status(400).send();
  });
});

//SIGN OUT
app.delete('/api/logout', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

//CREATE PLAYER
app.post('/api/players', authenticate, (req, res) => {

  Player.findOne({
    first_name: req.body.first_name,
    last_name:req.body.last_name
  }).then((player) => {
    if (player) {
      return res.status(400).send('Error: Player already exists');
    } else {
      let newPlayer = new Player({                  //create an instance of mongoose Player model
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        rating: req.body.rating,
        handedness: req.body.handedness,
        _creator: req.user._id
      });

      newPlayer.save().then((doc) =>{               //save player to db
        res.send(doc)
      }, (e) => {
        res.status(400).send(e);
      });
    }
  })
});

//LIST ALL PLAYERS
app.get('/api/players', authenticate, (req, res) => {
  Player.find({
    _creator: req.user._id                        //only returns player  made by this user
  }).then((players) =>{
    res.send({players});
  }, (e) => {
    res.status(400).send(e);
  });
});

//SHOW PLAYER
app.get('/api/players/:id', authenticate, (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {                     //validate id
    return res.status(404).send();
  };

  Player.findOne({
    _id: id,
    _creator: req.user._id                         //only returns player  made by this user
  }).then((player) => {
    if (!player) {                                //handles the error if ID isn't found
      return res.status(404).send();
    }

    res.send({player});
  }).catch((e) => {
    res.status(400).send();
  });
});

//DELETE PLAYER
app.delete('/api/players/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {                      //validate id
    return res.status(404).send();
  }

  Player.findOneAndRemove({
    _id: id,
    _creator: req.user._id                          //only returns player  made by this user
  }).then((player) => {                             //create an instance of mongoose model
    if (!player) {                                 //handles the error if ID isn't found
      return res.status(400).send();
    }

    res.send({player});
  }).catch((e) => {
    res.status(400).send();
  });
});

//UPDATE PLAYER
app.patch('/api/players/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['first_name', 'last_name', 'rating', 'handedness']);
  if (!ObjectID.isValid(id)) {                       //validate id
    return res.status(404).send();
  };

  Player.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((player) => {  //make our call to find by id and update
    if (!player) {
      return res.status(404).send();                  //handles the error if ID isn't found
    }

    res.send({player});
  }).catch((e) => {
    res.status(400).send();
  })
});

module.exports = {app};
