const User = require('./../models/user');                           //gain access to user model

let authenticate = (req, res, next) => {                            //middleware functions get 3 arguments - req,res, next.  The actual route won't run until next gets called
  let getToken = req.headers.authorization                          //get auth token
  let token = getToken ? getToken.slice(7) : getToken;              //remove Bearer from string

  User.findByToken(token).then((user) => {                          //call the class method and pass in params of token to find user. .then callback with user passed in
    if (!user) {
      return Promise.reject();                                      //if we can't find user we return a new promise reject to stop code and run .catch below
    }

    req.user=user;                                                  // else we modify the request and set the request user equal to the user we found
    req.token = token;                                              //set the request token equal to the token we found
    next();                                                         //have to call next to go to next LOC in Controllers
  }).catch((e) => {
    res.status(403).send();
  })
}

module.exports = {authenticate};
