/*
*This file stores all the handlers
*
*/


//dependencies
let dataLib = require('./data');
let helpers = require('./helpers');
let config = require('../config');

//main code
let handlers = {};


/*
*   HTML API HANDLERS BELOW
*
*/

handlers.index = (data, callback)=>{
    //only supports GET
    if (data.method == 'get'){

        let templateSpecificData = {
            'head.title': 'Uptime Monitor',
            'head.description': 'Uptime monitor gives you a unique ability to monitor any HTTP/HTTPS websites. Whenever a site goes down or back up, we\'ll notify you via sms',
             'body.class': 'index'
        }
        helpers.getTemplate('index', templateSpecificData, (err, templateData)=>{
            if(!err && templateData){
                //add the header and footer 
                helpers.addUniversalTemplates(templateData, templateSpecificData, (err, tempData)=>{
                    if(!err && tempData.length > 0){
                        console.log("perfect template")
                        callback(200, tempData, 'html');
                    }
                    else {
                        callback(500, 'Could not generate complete template', 'html')
                    }
                })
            }
            else {
                callback(500, undefined, 'html')
            }
        });
    }
    else {
        callback(405, undefined, 'html');
    }
};

handlers.favicon = (data, callback)=>{
    if(data.method == 'get'){
        helpers.readStaticAsset('favicon.ico', (err, staticData)=>{
            if(!err && staticData){
                callback(200, staticData, 'favicon');
            }
            else {
                console.log("didnt find any favicon")
                callback(500)
            }
        });
    }
    else {
        callback(405)
    }
};

handlers.public = (data, callback)=>{
    if(data.method == 'get'){
        let trimmedAssetName = data.trimmedPath.replace('public/', '');
        if(trimmedAssetName.length > 0){
            helpers.readStaticAsset(trimmedAssetName, (err, assetData)=>{
                if(!err && assetData.length > 0){
                    //determine the file extension
                    let contentType = 'plain';
                    if(trimmedAssetName.indexOf('.css')> -1){
                        contentType = 'css'
                    }
                    else if(trimmedAssetName.indexOf('.jpg')> -1){
                        contentType = 'jpg'
                    }
                    else if(trimmedAssetName.indexOf('.png')> -1){
                        contentType = 'png'
                    }
                    else if (trimmedAssetName.indexOf('ico') > -1){
                        contentType = 'favicon'
                    }
                    callback(200, assetData, contentType);
                }
                else {
                    callback(404)
                }
            });
        }
        else {
            console.log('No specified asset found in public')
            callback(404);
        }
    }
    else {
        callback(405);
    }
};

//Create Account
handlers.accountCreate = (data, callback)=>{
    //only supports GET
    if (data.method == 'get'){

        let templateSpecificData = {
            'head.title': 'Create an Account',
            'head.description': 'It\'s easy and takes less than 30 seconds to get an account',
             'body.class': 'accountCreate'
        }
        helpers.getTemplate('accountCreate', templateSpecificData, (err, templateData)=>{
            if(!err && templateData){
                //add the header and footer 
                helpers.addUniversalTemplates(templateData, templateSpecificData, (err, tempData)=>{
                    if(!err && tempData.length > 0){
                        callback(200, tempData, 'html');
                    }
                    else {
                        callback(500, 'Could not generate complete template', 'html')
                    }
                })
            }
            else {
                callback(500, undefined, 'html')
            }
        });
    }
    else {
        callback(405, undefined, 'html');
    }
};

//Create Account
handlers.sessionCreate = (data, callback)=>{
    //only supports GET
    if (data.method == 'get'){

        let templateSpecificData = {
            'head.title': 'Login to your Account',
            'head.description': 'Enter your registered phone number and password to log in.',
             'body.class': 'sessionCreate'
        }
        helpers.getTemplate('sessionCreate', templateSpecificData, (err, templateData)=>{
            if(!err && templateData){
                //add the header and footer 
                helpers.addUniversalTemplates(templateData, templateSpecificData, (err, tempData)=>{
                    if(!err && tempData.length > 0){
                        callback(200, tempData, 'html');
                    }
                    else {
                        callback(500, 'Could not generate complete template', 'html')
                    }
                })
            }
            else {
                callback(500, undefined, 'html')
            }
        });
    }
    else {
        callback(405, undefined, 'html');
    }
};

handlers.sessionDeleted = (data, callback)=>{
    //only supports GET
    if (data.method == 'get'){

        let templateSpecificData = {
            'head.title': 'Logout',
            'head.description': 'You have been successfully logged out, see you soon.',
             'body.class': 'sessionDeleted'
        }
        helpers.getTemplate('sessionDeleted', templateSpecificData, (err, templateData)=>{
            if(!err && templateData){
                //add the header and footer 
                helpers.addUniversalTemplates(templateData, templateSpecificData, (err, tempData)=>{
                    if(!err && tempData.length > 0){
                        callback(200, tempData, 'html');
                    }
                    else {
                        callback(500, 'Could not generate complete template', 'html')
                    }
                })
            }
            else {
                callback(500, undefined, 'html')
            }
        });
    }
    else {
        callback(405, undefined, 'html');
    }
};


//Edit Account Details
handlers.accountEdit = (data, callback)=>{
    //only supports GET
    if (data.method == 'get'){

        let templateSpecificData = {
            'head.title': 'Edit Account',
             'body.class': 'accountEdit'
        }
        helpers.getTemplate('accountEdit', templateSpecificData, (err, templateData)=>{
            if(!err && templateData){
                //add the header and footer 
                helpers.addUniversalTemplates(templateData, templateSpecificData, (err, tempData)=>{
                    if(!err && tempData.length > 0){
                        callback(200, tempData, 'html');
                    }
                    else {
                        callback(500, 'Could not generate complete template', 'html')
                    }
                })
            }
            else {
                callback(500, undefined, 'html')
            }
        });
    }
    else {
        callback(405, undefined, 'html');
    }
};


//Account has been Deleted
handlers.accountDeleted = (data, callback)=>{
    //only supports GET
    if (data.method == 'get'){

        let templateSpecificData = {
            'head.title': 'Account Deleted',
            'head.body': 'Account has been deleted',
             'body.class': 'accountDeleted'
        }
        helpers.getTemplate('accountDeleted', templateSpecificData, (err, templateData)=>{
            if(!err && templateData){
                //add the header and footer 
                helpers.addUniversalTemplates(templateData, templateSpecificData, (err, tempData)=>{
                    if(!err && tempData.length > 0){
                        callback(200, tempData, 'html');
                    }
                    else {
                        callback(500, 'Could not generate complete template', 'html')
                    }
                })
            }
            else {
                callback(500, undefined, 'html')
            }
        });
    }
    else {
        callback(405, undefined, 'html');
    }
};

//create a new check template
handlers.checksCreate = (data, callback)=>{
    //only supports GET
    if (data.method == 'get'){

        let templateSpecificData = {
            'head.title': 'Create a new check',
             'body.class': 'checksCreate'
        }
        helpers.getTemplate('checksCreate', templateSpecificData, (err, templateData)=>{
            if(!err && templateData){
                //add the header and footer 
                helpers.addUniversalTemplates(templateData, templateSpecificData, (err, tempData)=>{
                    if(!err && tempData.length > 0){
                        callback(200, tempData, 'html');
                    }
                    else {
                        callback(500, 'Could not generate complete template', 'html')
                    }
                })
            }
            else {
                callback(500, undefined, 'html')
            }
        });
    }
    else {
        callback(405, undefined, 'html');
    }
};


//checks edit 
handlers.checksEdit = (data, callback)=>{
    //only supports GET
    if (data.method == 'get'){

        let templateSpecificData = {
            'head.title': 'Edit Checks',
             'body.class': 'checksEdit'
        }
        helpers.getTemplate('checksEdit', templateSpecificData, (err, templateData)=>{
            if(!err && templateData){
                //add the header and footer 
                helpers.addUniversalTemplates(templateData, templateSpecificData, (err, tempData)=>{
                    if(!err && tempData.length > 0){
                        callback(200, tempData, 'html');
                    }
                    else {
                        callback(500, 'Could not generate complete template', 'html')
                    }
                })
            }
            else {
                callback(500, undefined, 'html')
            }
        });
    }
    else {
        callback(405, undefined, 'html');
    }
};

//Dashboard view template
handlers.checkList = (data, callback)=>{
    //only supports GET
    if (data.method == 'get'){

        let templateSpecificData = {
            'head.title': 'Dashboard',
             'body.class': 'checkList'
        }
        helpers.getTemplate('Dashboard', templateSpecificData, (err, templateData)=>{
            if(!err && templateData){
                //add the header and footer 
                helpers.addUniversalTemplates(templateData, templateSpecificData, (err, tempData)=>{
                    if(!err && tempData.length > 0){
                        callback(200, tempData, 'html');
                    }
                    else {
                        callback(500, 'Could not generate complete template', 'html')
                    }
                })
            }
            else {
                callback(500, undefined, 'html')
            }
        });
    }
    else {
        callback(405, undefined, 'html');
    }
};
/*
*   JSON API HANDLERS BELOW
*
*/
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
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    
    if (firstName && lastName && phone && password && tosAgreement){
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
                    dataObj.tosAgreement = tosAgreement;

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
        console.log("token recieved is ->", tokenID)
        handlers._tokens.verifyToken(tokenID, phone, (res)=>{
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
                                data.hashedPassword = helpers.hash(password);
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
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.length == 10 ? data.payload.phone : false;
    if(phone){
        let tokenID = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
        console.log("token for delete is ", tokenID)
        handlers._tokens.verifyToken(tokenID,phone,(isValid)=>{
            if(isValid){
                dataLib.read('users', phone, (err, userData)=>{
                    if(!err && userData){
                        let checks = userData.checks;
                        dataLib.delete('users', phone, (err)=>{
                            if(!err){
                                //also delete all the checks related to this user
                                let checksToDelete = typeof(checks) !== undefined && checks instanceof Array ? checks.length : 0 ;
                                let deleteCheckErr = false;
                                let checksDeleted = 0;

                                if(checksToDelete > 0){
                                    //iterate the checks and delete them
                                    checks.forEach(checkId => {
                                        dataLib.delete('checks', checkId, (err)=>{
                                            if(err){
                                                deleteCheckErr = true;
                                            }
                                            checksDeleted++;
                                            if(checksDeleted == checksToDelete){
                                                if(deleteCheckErr){
                                                    callback(500, {'Error': 'An error occured whle deleting checks for the given user'})
                                                }
                                                else {
                                                    callback(200);
                                                }
                                            }
                                        });
                                    });
                                }
                                else {
                                    callback(200)
                                }
                            }
                            else {
                                console.log("error while deleting --> ", err);
                                callback(400, {'Error': 'Couldn\'t delete the specified user'})
                            }
                        });
                    }
                    else {
                        callback(404, {'Error': 'User doesn\'t exist'})
                    }
                });
            }
            else {
                callback(401, {'Error': 'Unauthenticated user is not allowed'});
            }
        });
    }
    else {
        callback(400, {'Error': 'Phone number provided seems to be damaged'});
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
    let id = typeof(data.queryString.id) == 'string' && data.queryString.id.length > 0 ? data.queryString.id : false;
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
    console.log("phone and password are ->", phone, " ", password);
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
    let tokenID = typeof(data.payload.id) == 'string' && data.payload.id.length > 0? data.payload.id : false;
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
                console.log('token expired')
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
    else {
        callback(405, {'Error': 'Method not defined'})
    }
}

//CONTAINERS FOR CHECKS
handlers._checks = [];

handlers._checks.get = (data, callback) => {
    let id = typeof(data.queryString.id) == 'string' && data.queryString.id.length == 20 ? data.queryString.id : false;

    //lookup the user with this check id
    dataLib.read('checks', id, (err, checkData)=>{
        if(!err && checkData){
            let phone = typeof(checkData.phone)=='string' && checkData.phone.length > 0 ? checkData.phone : false;
            if(phone){
                //verify the token
                let token = typeof(data.headers.token)=='string' && data.headers.token.length > 0 ? data.headers.token : false;
                console.log("token is ->", token);
                handlers._tokens.verifyToken(token, phone, (res)=>{
                    if(res){
                        console.log("token is ok for check get")
                        //send the check details
                        callback(200, checkData);
                    }
                    else {
                        callback(403, {'Error': 'Unauthenticated user for given check'})
                    }

                });  
            }
            else {
                console.log(err);
                callback(403,{'Error': 'Could not get user details for given check'})
            }
        }
        else{
            callback(404, {'Error': 'Check not found'})
        }
    });
};
//required : protocol, url, method,successCodes, timeoutSeconds
//optional data : none
handlers._checks.post = (data, callback) => {
    let protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    let url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false; 
    let method = typeof(data.payload.method) == 'string' && ['get', 'put', 'delete', 'post'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    let successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && (data.payload.timeoutSeconds%1 == 0) && data.payload.timeoutSeconds >= 1 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        //get the token from the headers
        let token = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
        if(token){
            //verify the token
            dataLib.read('tokens', token, (err, tokenData)=>{
                if(!err && tokenData){
                    //lookup the user
                    let phone = tokenData.phone;
                    dataLib.read('users', phone, (err, userData)=>{
                        if(!err && userData){
                            //look for checks used by the user
                            let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                            if(userChecks.length < config.maxChecks){
                                //create a new check and add it to the userChecks list
                                console.log("allowed to create a new check", userChecks.length+1);
                                checkID = helpers.createRandomString(20);
                                checkData = {
                                 'id' : checkID,
                                 'timeoutSeconds': timeoutSeconds,
                                 'phone': phone,
                                 'url': url,
                                 'method': method,
                                 'successCodes': successCodes,
                                 'protocol': protocol  
                                }

                                //save the check with unique check id and reference the id to the user
                                dataLib.create('checks', checkID, checkData, (err)=>{
                                    if(!err){
                                        //link the check id with the respective user
                                        userData.checks = userChecks;
                                        userData.checks.push(checkID)
                                        dataLib.update('users', phone,userData, (err)=>{
                                            if(!err){
                                                console.log("check added successfully");
                                                callback(200);
                                            }
                                            else{
                                                console.log(err);
                                                callback(500, {'Error': 'Unable to link the check'});
                                            }
                                        });
                                    }
                                    else {
                                        console.log(err);
                                        callback(500, {'Error': 'Could not create a new check'})
                                    }
                                });
                            }
                            else {
                                callback(400, {'Error': 'Checks Limit exceeded'});
                            }
                        }
                        else {
                            console.log("valid token but no user with the token")
                            callback(403, {'Error': 'Unauthenticated request with valid token'})
                        }
                    });

                }
                else {
                    console.log("token not found in dataLib", err)
                    callback(401, {'Error': 'Unauthenticated User'})
                }
            });
        }
        else {
            callback(400, {'Error': 'Token not present'})
        }
    }
    else {
        console.log("Error recieving all details from the user")
        callback(400, {'Error': 'Did not recive all the parameters'})
    }
};
handlers._checks.put = (data, callback) => {
    let id = typeof(data.payload.id) == 'string' && data.payload.id.length == 20 ? data.payload.id : false;

    let protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    let url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false; 
    let method = typeof(data.payload.method) == 'string' && ['get', 'put', 'delete', 'post'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    let successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && (data.payload.timeoutSeconds%1 == 0) && data.payload.timeoutSeconds >= 1 ? data.payload.timeoutSeconds : false;

    if(id){
        //verify if the request is authenticated
        dataLib.read('checks', id, (err,checkData)=>{
            if(!err && checkData){
                handlers._tokens.verifyToken(data.headers.token,checkData.phone, (verifyErr)=>{
                    if(!err){
                        if(protocol || url || method || successCodes || timeoutSeconds){
                            //get check data 
                            dataLib.read('checks', id, (err, checkData)=>{
                                if(!err && checkData){
                                    if(protocol){
                                        checkData.protocol = protocol;
                                    }
                                    if(url){
                                        checkData.url = url;
                                    }
                                    if(method){
                                        checkData.method = method;
                                    }
                                    if(successCodes){
                                        checkData.successCodes = successCodes;
                                    }
                                    if(timeoutSeconds){
                                        checkData.timeoutSeconds = timeoutSeconds;
                                    }
                                    //now update the data
                                    dataLib.update('checks', id, checkData, (err)=>{
                                        if(!err){
                                            callback(false);
                                        }
                                        else {
                                            console.log("error while updating -> ", err);
                                            callback(500, {'Error': 'Couldn\'t update the check details'});
                                        }
                                    });
                                }
                                else {
                                    callback(500, {'Error': 'Unable to load check data'})
                                }
                            });
                        }
                        else {
                            console.log("no data to edit")
                            callback(400, {'Error': 'No Data recieved to update'})
                        }
                        
                    }
                    else {
                        callback(403, {'Error': 'Unauthenticated request'})
                    }
                });
            }
            else {
                callback(404, {'Error': 'Check not found'});
            }
        });

    }
    else {
        callback(400, {'Error':'Missing check ID to delete'});
    }
};
handlers._checks.delete = (data, callback) => {
    let checkID = typeof(data.queryString.id)=='string' && data.queryString.id.length > 0 ? data.queryString.id : false;
    let token = typeof(data.headers.token) == 'string' && data.headers.token.length > 0 ? data.headers.token : false;
    if(checkID && token){
        //lookup the user and verify its token
        dataLib.read('checks', checkID, (err, checkData)=>{
            if(!err && checkData){
                console.log('verifying for ', token,' and ', checkData.phone );
                //get the phone and verify the token
                handlers._tokens.verifyToken(token, checkData.phone, (verfyres)=>{
                    console.log(verfyres)
                    if(verfyres){
                        //delete the check and update the check list in user object too
                        dataLib.delete('checks', checkID, (delerr)=>{
                            if(!delerr){
                                console.log("check deleted");
                                //update the check list in the user checklist
                                dataLib.read('users',checkData.phone, (err, userData)=>{
                                    if(userData && !err){
                                        let checks = userData.checks;
                                        if(checks.length > 0){
                                            checks.pop(checkID);
                                            console.log("popped successfully")
                                            userData.checks = checks
                                            //now update the data
                                            dataLib.update('users', checkData.phone,userData, (err)=>{
                                                if(!err){
                                                    console.log("updated successfully")
                                                    callback(200);
                                                }
                                                else {
                                                    callback(500, {'Error': 'Unable to load user check list after deleting'})
                                                }
                                            });
                                        }
                                        else {
                                            console.log("checks list is already empty")
                                            callback(400, {'Error': 'Check list is empty already'})
                                        }
                                    }
                                    else {
                                        console.log(err);
                                        callback(500, {'Error': 'Unable to update user data'})
                                    }
                                });
                            }
                            else {
                                callback(500, {'Error': 'Unable to delete check from db'});
                            }
                        });

                    }
                    else {
                        callback(403, {'Error': 'Unauthenticated user for given token'})
                    }
                }); 
            }
            else {
                callback(400, {'Error': 'Could not find given check id'});
            }
        });
    }
    else {
        callback(400, {'Error': 'Check id/token not given'});
    }
};
//CONTAINERS END

module.exports = handlers;