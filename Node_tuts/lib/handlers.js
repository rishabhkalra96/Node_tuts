/*
*This file stores all the handlers
*
*/


//dependencies


//main code
var handlers = {};

//a ping route handler so that we can check if the server is alive or dead
handlers.ping = function(data, callback){
    callback(200);
};

<<<<<<< HEAD
=======
handlers.sampler = function(data, callback){
    //console.log("details of the req", data, "\n")
    callback(406, {'name': "Sampler Handler"});
};

>>>>>>> a0e173517994abb88ee80c774ab049ac4e13e3df
handlers.notFound = function(data, callback){
    //console.log("details of the req", data, "\n")
    callback(404);
};

module.exports = handlers;