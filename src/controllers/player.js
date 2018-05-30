const express = require('express')                                  //Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
const router = express.Router()
const bodyParser = require('body-parser');                          //Parse incoming requests body in a middleware before your handlers can use req.body - https://medium.com/@adamzerner/how-bodyparser-works-247897a93b90
const {ObjectID} = require('mongodb');                              //ObjectID from mongodb library - this gives access to ObjectID.isValid

const Player = require('../models/player');
const {authenticate} = require('../middleware/authenticate');

router.use(bodyParser.json());                                      //middleware - takes the body data sent from client json and converts it to an object attaching it on to the request object as req.body

//CREATE PLAYER
router.post('/', authenticate, (req, res) => {                       // every express route of gets at least two args - the URL and callback func that gets called with the req and res objects
  Player.findOne({                                                   //uses mongoose to query and find if there is a player with first and last name in req
    first_name: req.body.first_name,
    last_name:req.body.last_name
  }).then((player) => {
    if (player) {
      let err = new Error('Player Aleady Exists.');
      res.status(409).send(err);
    } else {
      let newPlayer = new Player({                                  //create an instance of mongoose Player model
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        rating: req.body.rating,
        handedness: req.body.handedness,
        created_by: req.user._id,
      });

      newPlayer.save().then((player) => {                           //saves player model to db. f things go well we send player doc back in .then
        let body = {
        success: true,
        player: player
      };
        res.status(201).send(body)                                  //callback for success
      }, (e) => {
        res.status(409).send(e);                                    //callback for error
      });
    }
  })
});

//LIST ALL PLAYERS
router.get('/', authenticate, (req, res) => {
  Player.find({created_by: req.user._id})                           //only returns player  made by this user
  .then((players) =>{
    if (players){
      let body = {
        success: true,
        players: players
    };
      res.send(body);
    }else {
      let body = {
        success: true,
        player: []
      };
        res.send(body);
    }
  }, (e) => {
    res.status(404).send(e);
  });
});

//DELETE PLAYER
router.delete('/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {                                       //checks if id is a validate id  --tests still pass without this if statement
    return res.status(404).send();                                   //returns 404 that the ID isn't valid to handle CastError thats thrown, stops execution and sends empty body
  }

  Player.findOneAndRemove({                                          //returns the object and deletes it
    _id: id,                                                         // mongoose takes the id string and converts it to an object id, then runs the query
    created_by: req.user._id                                         //only returns player made by this user
    }).then((player) => {                                            //create an instance of mongoose model
    if (!player) {                                                   //handles the error if player isn't found
      return res.status(404).send();
    }

      res.status(200).send();
  }).catch((e) => {
    res.status(404).send();
  });
});

// //SHOW PLAYER
// router.get('/:id', authenticate, (req, res) => {
//   let id = req.params.id;
//
//   if (!ObjectID.isValid(id)) {                                     //validate id
//     return res.status(404).send();
//   };
//
//   Player.findOne({
//     _id: id,
//     _creator: req.user._id                                        //only returns player made by this user
//   }).then((player) => {
//     if (!player) {                                                //handles the error if ID isn't found
//       return res.status(403).send();
//     }
//
//     res.send({player});
//   }).catch((e) => {
//     res.status(400).send();
//   });
// });


// //UPDATE PLAYER
// router.patch('/:id', authenticate, (req, res) => {
//   let id = req.params.id;
//   let body = _.pick(req.body, ['first_name', 'last_name', 'rating', 'handedness']);
//   if (!ObjectID.isValid(id)) {                                   //validate id
//     return res.status(404).send();
//   };
//
//   Player.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((player) => {  //make our call to find by id and update
//     if (!player) {
//       return res.status(404).send();                              //handles the error if ID isn't found
//     }
//
//     res.send({player});
//   }).catch((e) => {
//     res.status(400).send();
//   })
// });

module.exports = router;
