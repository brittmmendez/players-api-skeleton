const {User} = require('./../models/user');   //gain access to user model

let authenticate = (req, res, next) => {
  let token = req.header('x-auth');           //get auth token from request header

  User.findByToken(token).then((user) => {   //call the class method and pass in params of token to find user
    if (!user) {
      return Promise.reject();               //if we can't find user we stop and reject
    }

    req.user=user;                           // else we set the request user equal to the user we found
    req.token = token;                       //set the token equal to the token we found
    next();                                  //have to call next to go to next LOC in /users/me
  }).catch((e) => {
    res.status(401).send();
  })
}

module.exports = {authenticate};
