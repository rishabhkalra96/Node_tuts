/*
*This file stores all the handlers
*
*/


//dependencies
var dataLib = require('./data');
var helpers = require('./helpers');

//main code
var handlers = {};

//a ping route handler so that we can check if the server is alive or dead
handlers.ping = function(data, callback){
    callback(200);
};

handlers.notFound = function(data, callback){
    //console.log("details of the req", data, "\n")
    callback(404);
};

//handler to handle CRUD for users api
handlers.users = function(data, callback){
    //check the method
    var allowedMethods = ['get', 'put', 'post', 'delete'];
    if(allowedMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }
};
//CONTAINER FOR handlers.users
handlers._users = {};
//to handle get request on users
handlers._users.get = function(data, callback){
    var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.length == 10 ? data.queryString.phone : false;
    if (phone){
        dataLib.read('users', phone, (err, data)=>{
            if(!err && data){
                delete data.hashedPassword
                callback(200, data);
            }
            else {
                callback(404, {'Error': 'User does not exist with this phone number'});
            }
        });
    }
    else {
        callback(400, {'Error': 'Missing Phone number in the fields'});
    }
};
//to handle post request on users
handlers._users.post = function(data, callback){
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAggreement = typeof(data.payload.tosAggreement) == 'boolean' && data.payload.tosAggreement == true ? true : false;
    
    if (firstName && lastName && phone && password && tosAggreement){
        //check if the user is already registered based on the phoneNumber
        
        dataLib.read('users', phone, (err, data)=>{
            //if error occurs, the file / user already exists, else new user
            if(!err){
                callback(400, {'Error': 'User already exists with this phone number'});
            }
            else {
                //new user
                var hashedPass = helpers.hash(password)
                if(hashedPass){

                    //preparing data
                    var dataObj = {};

                    dataObj.firstName = firstName;
                    dataObj.lastName = lastName;
                    dataObj.phone = phone;
                    dataObj.hashedPassword = hashedPass;
                    dataObj.tosAggreement = tosAggreement;

                    //create the new user
                    dataLib.create('users', dataObj.phone, dataObj, (err)=>{
                        if(!err){
                            callback(200);
                        }
                        else {
                            console.log(err);
                            callback(500, {'Error': 'Unable to create new user !'});
                        }
                    });

                }
                else {
                    callback(500, {'Error': 'Could not create user\'s hash '});
                }
            }
        });

    }
    else {
        callback(400, {'Error': 'Missing required fields'});
    }
};
//to handle put request on users
handlers._users.put = function(data, callback){
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.length == 10 ? data.payload.phone : false;
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.length > 0? data.payload.firstName: false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.length > 0? data.payload.lastName: false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.length > 0? data.payload.password: false;
    
    if(phone){
        //fetch the details from the given phone number, if exists
        dataLib.read('users', phone, (err, data)=>{
        if(!err && data){
            console.log("data came in as", data)

            //check if atleast one of them is not empty detail entered by the user
            if(firstName || lastName || password){
                if(firstName){
                    data.firstName = firstName;
                }
                if(lastName){
                    data.lastName = lastName;
                }
                if(password){
                    data.password = helpers.hash(password);
                }
                //now update the data
                dataLib.update('users', phone, data, (err)=>{
                    if(!err){
                        callback(false);
                    }
                    else {
                        console.log("error while updating -> ", err);
                        callback(500, {'Error': 'Couldn\'t update the user details'});
                    }
                });
            }
            else{
                callback(400, {'Error': 'No data sent to update'});
            }
        }
        else {
            callback(404, {'Error': 'No such user exists'});
        }
    });
    }
    else {
        //phone is invalid
        callback(404, {'Error': 'Error finding the phone for update'})
    }
};
//to handle delete request on users
handlers._users.delete = function(data, callback){
    var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.length == 10 ? data.queryString.phone : false;

    if(phone){
        dataLib.delete('users', phone, (err)=>{
            if(!err){
                callback(200);
            }
            else {
                console.log("error while deleting --> ", err);
                callback(400, {'Error': 'Couldn\'t delete the specified user'})
            }
        });
    }
    else {
        callback(400, {'Error': 'Could not find the specified user'});
    }
};

//CONTAINERS END

module.exports = handlers;