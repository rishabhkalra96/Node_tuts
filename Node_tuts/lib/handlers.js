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
handlers.ping = (data, callback)=>{
    callback(200);
};

handlers.notFound = (data, callback)=>{

    callback(404);
};

//handler to handle CRUD for users api
handlers.users = (data, callback)=>{
    //check the method
    let allowedMethods = ['get', 'put', 'post', 'delete'];

    if(allowedMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }
};
//CONTAINER FOR handlers.users
handlers._users = {};
//to handle get request on users
handlers._users.get = (data, callback)=>{
    let phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.length == 10 ? data.queryString.phone : false;
    if (phone){
        let tokenID = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
        handlers._tokens['verifyToken'](tokenID,phone, (res)=>{
            if(res){
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
                callback(401, {'Error': 'Unauthenticated users not allowed'})
            }
        });
    }
    else {
        callback(400, {'Error': 'Missing Phone number in the fields'});
    }
};
//to handle post request on users
handlers._users.post = function(data, callback){
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAggreement = typeof(data.payload.tosAggreement) == 'boolean' && data.payload.tosAggreement == true ? true : false;
    
    if (firstName && lastName && phone && password && tosAggreement){
        //check if the user is already registered based on the phoneNumber
        
        dataLib.read('users', phone, (err, data)=>{
            //if error occurs, the file / user already exists, else new user
            if(!err){
                callback(400, {'Error': 'User already exists with this phone number'});
            }
            else {
                //new user
                let hashedPass = helpers.hash(password)
                if(hashedPass){

                    //preparing data
                    let dataObj = {};

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
handlers._users.put = (data, callback)=>{
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.length == 10 ? data.payload.phone : false;
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.length > 0? data.payload.firstName: false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.length > 0? data.payload.lastName: false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.length > 0? data.payload.password: false;
    
    if(phone){
        //fetch the details from the given phone number, if exists
        let tokenID = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
        headers._tokens.verifyToken(tokenID, phone, (res)=>{
            if(res){
                dataLib.read('users', phone, (err, data)=>{
                    if(!err && data){
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
            else{
                callback(401, {'Error': 'Token is invalid/empty thus unauthorized'})
            }
        });
        
    }
    else {
        //phone is invalid
        callback(404, {'Error': 'Error finding the phone for update'})
    }
};
//to handle delete request on users
handlers._users.delete = (data, callback)=>{
    var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.length == 10 ? data.queryString.phone : false;

    if(phone){
        let tokenID = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
        handlers._tokens.verifyToken(tokenID,phone,(isValid)=>{
            if(isValid){
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
                callback(401, {'Error': 'Unauthenticated user is not allowed'});
            }
        });
    }
    else {
        callback(400, {'Error': 'Could not find the specified user'});
    }
};

//CONTAINERS END

//TOKENS
handlers.tokens = (data, callback)=>{
    let allowedMethods = ['put', 'post', 'delete', 'get'];
    if (allowedMethods.indexOf(data.method) > -1){
        //call respective sub handler
        handlers._tokens[data.method](data, callback);
    }
}

//CONTAINERS FOR TOKENS
handlers._tokens = {};

handlers._tokens.get = (data, callback)=>{
    let id = typeof(data.payload.id) == 'string' && data.payload.id.length > 0 ? data.payload.id : false;
    if(id){
        dataLib.read('tokens', id, (err, tokenData)=>{
            if(!err && tokenData){
                //check if the session is expired on the token and add a isExpired key accordingly
                let maxSession = Date.now();
                maxSession < tokenData.expires ? tokenData.expired = false : tokenData.expired = true;
                callback(200, tokenData);
            }
            else {
                callback(400, {'Error': 'Token not found'})
            }
        });
    }
    else{
        callback(400, {'Error': 'Token not provided'});
    }
};

handlers._tokens.post = (data, callback)=>{
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.length == 10 ? data.payload.phone : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.length > 0 ? data.payload.password : false;
    
    if (phone && password){
        //lookup into the user directory for specified user
        dataLib.read('users', phone, (err, userData)=>{
            if(!err && userData){
                //compare the hash password from this password 
                let hashedPass = helpers.hash(password);
                if (hashedPass == userData.hashedPassword){
                    //if valid, create a new token for further requests with random id and expiration time of 1 hour
                    let tokenID = helpers.createRandomString(70);
                    let expires = Date.now() + 1000*60*60;
                    if (tokenID){
                        let dataObj = {};
                        //create token object and write it
                        dataObj.phone = phone;
                        dataObj.id = tokenID;
                        dataObj.expires = expires;
                        dataLib.create('tokens', tokenID, dataObj, (err)=>{
                            if (!err){
                                callback(200, dataObj);
                            }
                            else {
                                callback(500, {'Error': 'Unable to generate/write token for specified user'});
                            }
                        });
                    }
                    else {
                        callback(500, {'Error': 'Unable to generate token'})
                    }
                }
                else {
                    callback(400, {'Error': 'Incorrect password for given user'});
                }
            }
            else {
                callback(400, {'Error': 'Couldn\'t find the specified user'});
            }
        });
    }
    else {
        //one of them is wrong, send error
        callback(400, {'Error': 'Missing parameters from phone or password'});
    }
};

handlers._tokens.put = (data, callback)=>{
    let tokenID = typeof(data.queryString.token) == 'string' && data.queryString.token.length > 0? data.queryString.token : false;
    //now look for a file which the same token id
    if(tokenID){
        //if the file doesn't exist , this will throw an error
        dataLib.read('tokens', tokenID, (err, fileData)=>{
            if(!err && fileData){
                let extendResponse = typeof(data.payload.extend) == 'boolean'? data.payload.extend : null;
                if(extendResponse !== null){
                    if(fileData.expires < Date.now()){
                        callback(400, {'Error': 'Cannot extend an expired token'})
                    }
                    else {
                        //extend the token for one more hour
                        fileData.expires = Date.now() + 1000*60*60      //extending the token by one more hour
                        //once the new expire time is set, simply write it back
                        dataLib.update('tokens',tokenID, fileData, (err)=>{
                            if (!err){
                                //everything went fine
                                callback(false)
                            }
                            else {
                                callback(400, {'Error': 'Unable to update the token session'})
                            }
                        });
                    }
                    
                }
                else {
                    callback(400, {'Error': 'Invalid Paramteres'})
                }
            }
            else {
                callback(400, {'Error': 'Token does not exist / invalid'})
            }
        })
    }
    else {
        callback(400, {'Error': 'Token not provided'});
    }
    
};

handlers._tokens.delete = (data, callback)=>{
    let tokenID = typeof(data.payload.id) == 'string' && data.payload.id.length > 0 ? data.payload.id : false;
    if(tokenID){
        //first read the token, if unable to read means token is absent / invalid, else delete
        dataLib.read('tokens', tokenID, (err, data)=>{
            if(err){
                //token not found, means token does not exist
                callback(400, {'Error': 'Token not found'});
            }
            else{
                dataLib.delete('tokens', tokenID, (err)=>{
                    if(!err){
                        callback(false)
                    }
                    else {
                        callback(400, {'Error': 'Unable to delete the session'})
                    }
                });
            }
        });
    }
    else {
        callback(400, {'Error': 'Invalid paramters'})
    }
    
};

//a special handler to check if the current user is an authenticated one or not
handlers._tokens.verifyToken = (id, phone, callback)=>{
    //lookup for a token in the token directory
    dataLib.read('tokens', id, (err, data)=>{
        if(!err && data){
            //found the token, now check if it matches the current user
            if(data.phone == phone && data.expires > Date.now()){
                callback(true)
            }
            else {
                callback(false)
            }
        }
        else {
            callback(false);
        }
    });
};
//CONTAINERS END

//CHECKS
handlers.checks = (data, callback)=>{
    let allowedMethods = ['put', 'post', 'delete', 'get'];
    if (allowedMethods.indexOf(data.method) > -1){
        //call respective sub handler
        handlers._checks[data.method](data, callback);
    }
}

//CONTAINERS FOR CHECKS
handlers._checks = [];
handlers._checks.get = (data, callback) => {
};
handlers._checks.post = (data, callback) => {};
handlers._checks.put = (data, callback) => {};
handlers._checks.delete = (data, callback) => {};
//CONTAINERS END

module.exports = handlers;