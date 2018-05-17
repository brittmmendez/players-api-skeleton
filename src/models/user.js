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

UserSchema.methods.toJSON = function () {                 //override the method generateAuthToken -  this will decide what gets sent back when a mongooose model is converted into a JSON VALUE
  let user = this;
  let userObject = user.toObject();

  return _.pick(userObject, ['_id', 'first_name', 'last_name', 'email'])
}

//instance method responsible for adding a token on to the individual user document
UserSchema.methods.generateAuthToken = function () {      //use reg function and not Array function because arrays don't bins 'this' keyword
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString(); //generates the token

  user.tokens.push({access, token});                      //update users array to push in the {auth: token} object we created above

  return user.save().then(() => {                         // we updated the user model above but need to save.. we a retuning the save to chain on a promise in server.js
    return token;
  });
};

module.exports = {User}
