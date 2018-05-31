const mongoose = require('mongoose');                              // not loading in the file I made, loading in normal mongoose library
const validator = require('validator');                            //this library is being used to validate email
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({                           //setup the schema for a user model in this way rather than how I did for player so that it can take on properties and add on custome methods.
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
  tokens: [{                                                        //tokens is an array
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
  let user = this;                                                 //gives access to individual document
  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, (process.env.JWT_SECRET || 'secret')).toString(); //generates the token with two arguments - the object(user id turned into a string) we want to sign and the secret

  user.tokens.push({access, token});                               //update users array to push in the {auth: token} object we created above

  return user.save().then(() => {                                  // we updated the local user model above but need to save.. we are retuning the save to chain on a promise in server.js
    return token;
  });
};

UserSchema.pre('save', function (next) {                           //.pre is mongoose middleware that is called before we 'save' the doc to the database. have to provide next and have to call it or middleware will not complete
  let user = this;

  if (user.isModified('password')){                               //takes the password prop and returns T if it is modified.  we only want to hash if it was modified
    bcrypt.genSalt(10, (err, salt) => {                           //creates the salt. takes two arguments ->  it's async. first is the number of rounds you want to use to generate salt, the 2nd is the callback
      bcrypt.hash(user.password, salt, (err, hash) => {           //call hash with 3 args user.pw, salt, and cb func with err or hash val
        user.password = hash;                                     //update user document with hash we just made as the password
        next();                                                   //move on to save
      });
    });
  }else {
    next();
  }
});

//model methods:
UserSchema.statics.findByToken = function (token) {            //.statics makes this an model method instead of instance method.  needs access to binding and takes in the token
  let User = this;
  let decoded;                                                 // stores decoded JWT values -> set as undefined bc jwt.verify will throw an error if secret doesn't match or if token is manipulated. so we use a try catch block

  try {                                                        //try to verify token. if error occurs, catch the error
    decoded = jwt.verify(token, (process.env.JWT_SECRET || 'secret'));  //verify by passing in the token and the secret
  } catch (e) {
    return Promise.reject();                                   //if we can't decode user we return a new promise stop and reject
  }

  return User.findOne({                                        //if we are able to successfully decode above, this will run to find associated user
    '_id': decoded._id,                                        //look for user whose _id is the same as that in decoded
    'tokens.token': token,                                     // query a nested document-> wrap value in quotes.  Whose tokens array has an object where the token property equals the token passed in LOC 71
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {   //model method used for loggin in.  takes in 2 args. email and Password
  let User = this;

  return User.findOne({email}).then((user) => {                       //find one user whose email matches, we are retuning and chaining it with the .then call in controller
    if (!user) {
      return promise.reject();                                        //if we don't get a user return a rejected promise which will trigger the catch case in controller
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) =>{          //bcrypt method that compares the password input with the hashed pw in db, and returns a cb func with and err or result(T or F)
        if (res) {
          resolve(user);                                             //resolves the promise and sends user back
        }else {
          reject();                                                //rejects the promise and sends 400 back
        }
      });
    });
  });
};

// const _ = require('lodash');
// UserSchema.methods.removeToken = function (token) {            //used for logout route to implement in future
//   let user = this;
//   return user.update({
//     $pull: {
//       tokens: {token}
//     }
//   });
// };

let User = mongoose.model('User', UserSchema);                    //restores functionality of User

module.exports = User
