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

//create an alphanumerc string of given length
helpers.createRandomString = (strLen)=>{
    strLen = typeof(strLen) == 'number' && strLen > 0 ? strLen : false;
    if(strLen){
        //create a string of combination of alphabets and numbers
        let possibleChars = 'abcdefghijklmnopqrstuvwxyz1234567890'

        var RandomStr = '';
        for(i = 0; i < strLen; i++){
            RandomStr += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
        }
        return RandomStr;
    }
    else return false;
};

//export this module
module.exports = helpers;