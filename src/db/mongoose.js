const mongoose = require('mongoose');                                 //Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
mongoose.connect('mongodb://localhost:27017/PingPong');               //connecting Mongoose to Mongodb

module.exports = {mongoose};
