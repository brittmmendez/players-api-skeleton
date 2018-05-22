const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({                      //setup the schema for a user
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name:{
    type: String,
    required: true,
    trim: true
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
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});


UserSchema.methods.generateAuthToken = function () {               //instance method to add token on for user document use reg function and not Array function because arrays don't bind 'this' keyword
  let user = this;
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, (process.env.JWT_SECRET || 'secret')).toString(); //generates the token

  user.tokens.push({access, token});                               //update users array to push in the {auth: token} object we created above

  return user.save().then(() => {                                  // we updated the user model above but need to save.. we a retuning the save to chain on a promise in server.js
    return token;
  });
};

UserSchema.pre('save', function (next) {                           //is called before we save the doc to the database
  let user = this;

  if (user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) => {                           //create the salt
      bcrypt.hash(user.password, salt, (err, hash) => {           //call hash with user pw and salt with a cb func
        user.password = hash;                                     //update user document with new password
        next();                                                   //move on to save
      });
    });
  }else {
    next();
  }
});

// UserSchema.methods.removeToken = function (token) {            //used for logout route to implement in future
//   let user = this;
//   return user.update({
//     $pull: {
//       tokens: {token}
//     }
//   });
// };

//model methods:
UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;

  try {                                                           //to try to veridy token
    decoded = jwt.verify(token, (process.env.JWT_SECRET || 'secret'));
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) =>{
        if (res) {
          resolve(user);
        }else {
          reject();
        }
      });
    });
  });
};

let User = mongoose.model('User', UserSchema);

module.exports = User
