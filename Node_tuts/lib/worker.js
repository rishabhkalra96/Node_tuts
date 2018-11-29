/*
File to manage worker tasks
*/

//dependencies
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const dataLib = require('./data');
const helpers = require('./helpers');
const url = require('url');


const logLib = require('./logger');
//main code
let workers = {}

//loop definition, will call the gatherAllChecks after every one minute
workers.loop = ()=>{
    setInterval(()=>{
        workers.gatherAllChecks();
    }, 1000*60);
};

workers.rotateLogs = ()=>{
    //by default the parameter in list method is false, indicating "do not list zip files"
    //to list zip files also -> logLib.list(true, (err,logs)=>{})
    logLib.list(false,(err, logs)=>{
        if (!err && logs.length > 0){
            logs.forEach((logName)=>{
                let logId = logName.replace('.log','')
                let NewlogFileName = logId + '-' + Date.now();
                //compress the file
                logLib.compress(logId, NewlogFileName, (err)=>{
                    if (!err){
                        //truncate the logfile.log so that new data can come in
                        logLib.truncate(logId, (err)=>{
                            if(!err){
                                console.log('Successfully truncated', logName)
                            }
                            else {
                                console.log('Error truncating the log file ->', err);
                            }
                        });
                    }
                    else {
                        console.log('Error occurred while compressing the log files ->', err)
                    }
                });
            });
        }
        else {
            console.log('Could not find any logs to rotate')
        }
    });
};

//loop definition to execute log compression process once a day
workers.logRotationLoop = ()=>{
    setInterval(()=>{
        workers.rotateLogs();
    }, 1000*60*60*24);
};

workers.gatherAllChecks = ()=>{
    dataLib.list('checks', (err, checksList)=>{
        if(!err && checksList.length > 0){
            checksList.forEach((checkName)=>{
                dataLib.read('checks', checkName, (err, orgCheckData)=>{
                    if(!err && orgCheckData){
                        //send this checkData to the validator function and log as needed
                        workers.validateCheckData(orgCheckData);
                    }
                    else {
                        console.log('Error reading check data of ->', checkName);
                    }
                });
            });
        }
        else {
            console.log("There are no checks in the checks database");
        }
    });
};

workers.validateCheckData = (orgCheckData)=>{
    orgCheckData = typeof(orgCheckData)=='object' && orgCheckData !== null ? orgCheckData : {};
    orgCheckData.id = typeof(orgCheckData.id) == 'string' && orgCheckData.id.length == 20 ? orgCheckData.id : false;
    orgCheckData.url = typeof(orgCheckData.url) == 'string' && orgCheckData.url.length > 0 ? orgCheckData.url : false;
    orgCheckData.phone = typeof(orgCheckData.phone) == 'string' && orgCheckData.phone.trim().length == 10 ? orgCheckData.phone.trim() : false;
    orgCheckData.successCodes = typeof(orgCheckData.successCodes) !== undefined && orgCheckData.successCodes instanceof Array && orgCheckData.successCodes.length > 0 ? orgCheckData.successCodes : false;
    orgCheckData.method = typeof(orgCheckData.method) == 'string' && ['put', 'post', 'delete', 'get'].indexOf(orgCheckData.method) > -1 ? orgCheckData.method : false;
    orgCheckData.protocol = typeof(orgCheckData.protocol) == 'string' && ['http','https'].indexOf(orgCheckData.protocol) > -1 ? orgCheckData.protocol : false;
    orgCheckData.timeoutSeconds = typeof(orgCheckData.timeoutSeconds) == 'number' && orgCheckData.timeoutSeconds % 1 == 0 && orgCheckData.timeoutSeconds >= 1 && orgCheckData.timeoutSeconds <= 5 ? orgCheckData.timeoutSeconds : false;

    //adding additional parameters to recognise the check, its state and last time it was accessed
    orgCheckData.lastChecked = typeof(orgCheckData.lastChecked) == 'number' && orgCheckData.lastChecked > 0 ? orgCheckData.lastChecked : false;
    orgCheckData.state = typeof(orgCheckData.state) == 'string' && ['up', 'down'].indexOf(orgCheckData.state) > -1 ? orgCheckData.state : 'down';

    if(
        orgCheckData.id && orgCheckData.phone 
        && orgCheckData.url && orgCheckData.successCodes
        && orgCheckData.method && orgCheckData.protocol && orgCheckData.timeoutSeconds
        ){
            workers.performCheck(orgCheckData);
        }
        else {
            console.log('one of the parameters of check failed', orgCheckData );
        }
};

//perform the check on the original data
workers.performCheck = (orgCheckData)=>{
    let checkOutcome = {
        'responseCode' : false,
        'error': false
    }

    let OutcomeSent = false;

    //create the request
    let parsedUrl = url.parse(orgCheckData.protocol + '://' + orgCheckData.url);
    let hostName = parsedUrl.hostname;
    let path = parsedUrl.path; //Not using pathname because we need queryString also

    let requestDetails = {
        'method': orgCheckData.method.toUpperCase(),
        'path': path,
        'protocol': orgCheckData.protocol+":",
        'hostname': hostName,
        'timeout': orgCheckData.timeoutSeconds*1000
    };

    let moduleToUse = requestDetails.protocol == 'http:' ? http : https;
    //create the request with http/https module
    let req = moduleToUse.request(requestDetails, (res)=>{
        checkOutcome.responseCode = res.statusCode;
        if(!OutcomeSent){
            workers.processCheckOutcome(orgCheckData, checkOutcome)
            OutcomeSent = true;
        }
    });
    //Bind to the error event and log it if the outcome has not been sent yet
    req.on('error', (e)=>{
        checkOutcome.error = {
            'error': true,
            'value': e
        }
        if(!OutcomeSent){
            workers.processCheckOutcome(orgCheckData, checkOutcome)
            OutcomeSent = true;
        }
    });
    //Bind the timeout event and log it if the outcome has not been sent yet
    req.on('timeout', (e)=>{
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        }
        if(!OutcomeSent){
            workers.processCheckOutcome(orgCheckData, checkOutcome)
            OutcomeSent = true;
        }
    });
    //send the req
    req.end();
};

//process the checkoutcome and update the check data as needed, alert the user is necessary
//adding logic to handle the checks that have never been tested before (don't alert the user for these)
workers.processCheckOutcome = (orgCheckData, checkOutcome)=>{
    //decide the state from the reponse
    let state = !checkOutcome.error && checkOutcome.responseCode && orgCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
    //Decide if the user needs to be alerted
    let alertWarranted = orgCheckData.lastChecked && orgCheckData.state !== state ? true : false;

    //log the content to logFile
    let timeOfCheck = Date.now();
    workers.log(orgCheckData,checkOutcome,state,alertWarranted,timeOfCheck);
    //update the data regardless of the alert to the user
    let newCheckedData = orgCheckData;
    newCheckedData.state = state;
    newCheckedData.lastChecked = timeOfCheck;

    //update the respective check file
    dataLib.update('checks', newCheckedData.id, newCheckedData, (err)=>{
        if(!err){
            //Alert the user if warranted
            if(alertWarranted){
                workers.alertUserToStatusChange(newCheckedData);
            }
            else {
                console.log("Check status hasn't changed but updated, no alert triggered")
            }
        }
        else {
            console.log("Error trying to update one of the checks in the file");
        }
    });

    workers.alertUserToStatusChange = (data)=>{
        //Alert : Your check status for GET http://www.google.com is up
        let msg = 'Alert : Your check status for '+data.method.toUpperCase()+' '+data.protocol+'://'+data.url+' is '+data.state;
        helpers.sendTwilioSMS(data.phone, msg, (res)=>{
            if(!res){
                console.log("User updated via SMS successfully");
            }
            else {
                console.log("An error occured while alerting the user :", res);
            }
        });
    };

};

//init function to be called by index.js
workers.init = ()=>{
    console.log('\x1b[33m%s\x1b[0m','Workers up and running in the Background');
    //execute all checks once
    workers.gatherAllChecks();
    //loop through the checks after a set interval
    workers.loop();
    //compress all the logs immediately on starting
    workers.rotateLogs();
    //loop once every day to compress the uncompressed file
    workers.logRotationLoop();
};

//log method
workers.log = (orgCheckData,checkOutcome,state,alertWarranted,timeOfCheck)=>{
    //form Log Data
    let logData = {
        'data': orgCheckData,
        'outcome': checkOutcome,
        'state': state,
        'alert': alertWarranted,
        'time': timeOfCheck
    };
    //stringify the logData
    let logString = JSON.stringify(logData);

    //All logs from workers.js will be logged in checkID.txt
    logLib.append(orgCheckData.id, logString, (err)=>{
        if(err){
            console.log('logging failed', err)
        }
        else {
            console.log('logging succeeded')
        }
    });
};
//export this module
module.exports = workers;