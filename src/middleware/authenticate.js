const User = require('./../models/user');                           //gain access to user model

let authenticate = (req, res, next) => {
  let getToken = req.headers.authorization                          //get auth token
  let token = getToken ? getToken.slice(7) : getToken;              //remove Bearer from string

  User.findByToken(token).then((user) => {                          //call the class method and pass in params of token to find user
    if (!user) {
      return Promise.reject();                                      //if we can't find user we stop and reject
    }

    req.user=user;                                                  // else we set the request user equal to the user we found
    req.token = token;                                              //set the token equal to the token we found
    next();                                                         //have to call next to go to next LOC in UserController
  }).catch((e) => {
    res.status(403).send();
  })
}

module.exports = {authenticate};
