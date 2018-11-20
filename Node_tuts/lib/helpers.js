/*

Helpers for various modules

*/

//dependencies
var crypto = require('crypto');
var config = require('../config');
var queryString = require('querystring');
var https = require('https');
var path = require('path');
var fs = require('fs');

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

//twilio helper to send messages to specific users
helpers.sendTwilioSMS = (phone, msg, callback) =>{
    //verify the parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? '+91'+phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 ? msg.trim() : false;
    if(phone && msg){
        twilioPayload = {
            'From': config.twilio.fromPhoneOK,
            'To': phone,
            'Body': msg
        }
        let stringPayload = queryString.stringify(twilioPayload);
        let requestDetails = {
            'protocol' : 'https:',
            'hostname': 'api.twilio.com',
            'path' : '/2010-04-01/Accounts/'+config.twilio.sidOK+'/Messages.json',
            'method' : 'POST',
            'auth': config.twilio.sidOK +':'+config.twilio.authOK,
            'headers' : {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };
        //intitiate request
        let req = https.request(requestDetails, (res)=>{
            if(res.statusCode == 200 || res.statusCode == 201){
                console.log("twilio status is ok")
                callback(false);
            }
            else {
                callback(res.statusCode)
            }
        });
        //binding any req errors with error event so that it doesn't get thrown
        req.on('error', (e)=>{
            callback(e);
        });
        //writing to the payload
        req.write(stringPayload);
        //seding the request
        req.end();
    }
    else {
        console.log("phone/msg not present for twilio helper")
        callback('Phone or message not defined to send');
    }
};

//template fetcher
helpers.getTemplate = (templateName, callback)=>{
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    let templateDir = path.join(__dirname, '/../templates/');
    if(templateName){
        fs.readFile(templateDir+templateName+'.html', 'utf-8', (err, fileData)=>{
            if(!err && fileData){
                callback(false, fileData);
            }
            else {
                callback('An error occured while reading the template / Not found')
            }
        });
    }
    else{
        callback('A valid template name was not specified')
    }

};

//export this module
module.exports = helpers;