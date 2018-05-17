const mongoose = require('mongoose');         //load in mongoose ODM library to enforce stucture of data

mongoose.Promise = global.Promise;            //tell mongoose which promise library to use- native promises
mongoose.connect(process.env.MONGODB_URI);    //connect mongoose to our local mongodb or herokuDB so we can start writing data to db

module.exports = {mongoose};
