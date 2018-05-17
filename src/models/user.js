const mongoose = require('mongoose');
const validator = require('validator');

//stores the schema for a user
const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name:{
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
  },
  passwordConf: {
    type: String,
  }
});

module.exports = {User}
