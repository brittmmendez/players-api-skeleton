const express = require('express')                                     //Express -> popular Node.js framework that has a lot of features for web and mobile applications.
const router = express.Router()
const _ = require('lodash');                                           //Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc.
const bodyParser = require('body-parser');                             //Parse incoming requests body in a middleware before your handlers - https://medium.com/@adamzerner/how-bodyparser-works-247897a93b90

const User = require('../models/user');

router.use(bodyParser.json());                                         //middleware - takes the body data sent from client json and convert it to an object attaching it on to the request object

// CREATE USER
router.post('/user', (req, res) => {                                    // every express route of mine gets two args - the URL and callback func that gets called with the req and res objects
  let confirm_password =req.body.confirm_password
  let body = _.pick(req.body, ['first_name', 'last_name', 'email', 'password']);    //learned how to use picj to pick off the values I wanted instead of setting each equal as I did in players

  if (body.password !== confirm_password) {                            //confirm password
     let err = new Error('Passwords do not match.');
     res.status(409).send(err);
  } else {
    let user = new User(body);
    user.save().then(() => {
      return user.generateAuthToken();                                 //call the method to geenrate token
    }).then((token) => {
      let body = {
      success: true,
      token: token,
      user: {
        id: user._id
      }
    };
      res.status(201).header('x-auth', token).send(body);              //send the token back as an http header. x-auth is a custom header for our specific purpose.
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
      res.status(200).send(body);                                       //send the token back as an http header. x-auth is a custom header for our specific purpose.
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
// const authenticate = require('../middleware/authenticate');        //need to add import back in - Added feature to someday be the users profile page
// router.get('/users/:id', authenticate, (req, res) => {             //runs middleware authencate and sends response below if no errors
//   res.send(req.user);                                              //sending the user the request with the info we found/set in findByToken
// });


// //SIGN OUT
// router.delete('/logout', authenticate, (req, res) => {
//   req.user.removeToken(req.token).then(() => {
//     res.status(201).send({success: true});
//   }, () => {
//     res.status(400).send();
//   });
// // });

module.exports = router;
