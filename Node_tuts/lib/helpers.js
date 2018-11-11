/*

Helpers for various modules

*/

//dependencies
var crypto = require('crypto');
var config = require('../config');

//main code
var helpers = {};

//create SHA256 hash
helpers.hash = (str)=>{
    if(str.length>0 && typeof(str) == 'string'){
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }
    else return false;
};

//convert the string json into an object in all cases
helpers.convertJSONstr2JSON = (strJSON)=>{
    try {
        var JSONobj = JSON.parse(strJSON);
        return JSONobj;
    }
    catch (e){
        return {};
    }
};



//export this module
module.exports = helpers;