const express = require('express')  //Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
const router = express.Router()

//library imports
const _ = require('lodash');                    //Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc.
const bodyParser = require('body-parser');      //Parse incoming request bodies in a middleware before your handlers
const {ObjectID} = require('mongodb');          //Create a new ObjectID instance

const mongoose = require('mongoose');    //Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
mongoose.promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/PingPong');

//local imports
const Player = require('../models/player');
const User = require('../models/user');
const {authenticate} = require('../middleware/authenticate');

router.use(bodyParser.json());                     //middleware - takes the body data sent from client json and convert it to an object attaching it on to the request object

// CREATE USER
router.post('/user', (req, res) => {
  let confirm_password =req.body.confirm_password
  let body = _.pick(req.body, ['first_name', 'last_name', 'email', 'password']);

  if (body.password !== confirm_password) {                //confirm password
     let err = new Error('Passwords do not match.');
     res.status(409).send(err);
  } else {
    let user = new User(body);
    user.save().then(() => {
      return user.generateAuthToken();                       //call the method to geenrate token
    }).then((token) => {
      let body = {
      success: true,
      token: token,
      user: {
        id: user._id
      }
    };
      res.status(201).header('x-auth', token).send(body);               //send the token back as an http header. x-auth is a custom header for our specific purpose.
    }).catch((e) => {
      res.status(409).send(e);
    })
  };
});

// USER LOGIN
router.post('/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {    //call to veryfy if  user exsists with that email. check password
    user.generateAuthToken().then((token) => {
      let body = {
      success: true,
      token: token,
      user: {
        id: user._id
      }
    };
      res.status(200).send(body);               //send the token back as an http header. x-auth is a custom header for our specific purpose.
    });
  }).catch((e) =>{
    res.status(401).send();
  });
});

//UPDATE User
router.put('/user/:userId', (req, res) => {
  User.findByIdAndUpdate({_id: req.params.userId}, req.body, {new: true})
  .then((user) => {
    if (!user) {
      res.status(500).send();
    }

    let body = {
      success: true,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        id: user._id
      }
    }

    res.status(200).send(body);
  }).catch((e) => {
    res.status(400).send();
  })
});

// // GET /users/:id
// app.get('/api/users/:id', authenticate, (req, res) => {   //runs middleware authencate and sends response below if no errors
//   res.send(req.user);                                     //sending the user the request with the info we found/set in findByToken
// });


// //SIGN OUT
// app.delete('/api/logout', authenticate, (req, res) => {
//   req.user.removeToken(req.token).then(() => {
//     res.status(201).send({success: true});
//   }, () => {
//     res.status(400).send();
//   });
// // });

module.exports = router;
