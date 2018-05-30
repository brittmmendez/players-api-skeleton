const mongoose = require('mongoose');

const Player = mongoose.model('Player', {                          //create a Mongoose model so to store the data - 1st arg is the string name, 2nd is an ogject to define properties for a model
  first_name: {
    type: String,
    required: true,
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
    trim: true,
    enum: ['right', 'left']
  },
  created_by: {                                                   //creates association between user and player
    type: mongoose.Schema.Types.ObjectId,
  }
});

module.exports = Player;
