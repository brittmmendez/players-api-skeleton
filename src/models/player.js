const mongoose = require('mongoose');                              // not loading in the file I made, loading in normal mongoose library

const Player = mongoose.model('Player', {                          //create a Mongoose model so mongoose knows how to store our data - .model is a method -1st arg is the string name, 2nd is an ogject to define properties for a model
  first_name: {
    type: String,
    required: true,                                               //example of validator
  },
  last_name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  handedness: {
    type: String,
    required: true,
    trim: true,                                                   //trims off leading or trailing white spaces
    enum: ['right', 'left']
  },
  created_by: {                                                   //creates association between user and player
    type: mongoose.Schema.Types.ObjectId,
  }
});

module.exports = Player;
