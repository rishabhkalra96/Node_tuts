/*
Module to Handle all server related tasks
 */

//importing the configuration
const config = require('../config');

//Dependencies
const http = require('http');
const https = require('https');
//file system support to read files
var fs = require('fs');
//path module to access directories
var path = require('path');
//a built in module from node named url which is used to parse / read urls the user requests
//url parsing is done inside the callback function of createserver
var url = require('url');

//importing the handlers
var handlers = require('./handlers');

//importing helpers
var helpers = require('./helpers');

/* 
NOTE : This is the way how you can send SMS with twilio redentials
helpers.sendTwilioSMS('9971696729', 'Hello', (res)=>{
    console.log('the response after sending a message is ', res);
}); */


//To read Payload
var stringDecoder = require('string_decoder').StringDecoder;


//server object to handle all the tasks
let server = {}

//creating a server from the https module which defines what to do when the server is created
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key-pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

//creating a server from the http module which defines what to do when the server is created
server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req, res);
});

server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
    server.unifiedServer(req, res);
});

server.unifiedServer = function(req,res){
    //steps of parsing a user request
    
    //GET the method of request -> get/put/delete/post
    var method = req.method.toLowerCase();
    //PARSE THE URL / get the url

    /*
    *the below line does two things at once, the url.parse asks for the req being accessed and 
    *optionally passes a true parameter. The true parameter tells the url.parse to parse the 
    *query parameters using QueryString module. So, in url.parse ---> url and queryString modules are working
    *together to give you the required parsed url
    the parsed url will be an Url object containing all the information regarding the url
    example for request http://localhost:3000/foo/getmebitch/lol?hello=world
    Url{
        protocol: null,
        slashes: null,
        auth: null,
        host: null,
        port: null,
        hostname: null,
        hash: null,
        search: null,
        query: [Object: null prototype] {hello='world'},
        pathname: '/foo/getmebitch/lol',
        path: '/foo/getmebitch/lol',
        href: '/foo/getmebitch/lol'
    }
    the query parameters are recieved after ? in the url. If the url.parse has false, that means
    the query parameters will not be evaluated. In that case the above url will contain Url.query = hello=world
    of type string. Means, it will still store it but as a string. It will not parse it into an object
    */ 
    var parsedUrl = url.parse(req.url, true);

    //GET THE path
    //The pathname will return the path accessed by the user
    //example : user req -> http://localhost:3000/get-details/
    //path will be -> get-details
    var path = parsedUrl.pathname;

    //get the query parameters from the parsedUrl
    //the query parameters are the extra parameters which the user sends along with the requests
    //a general url containing query parameters -> localhost://3000/foo?hello=world
    //the parsedUrl.query will return a query object like {hello = world} and empty otherwise
    var queryObject = parsedUrl.query;
    //the trimmedUrl essentially trimms all the slashes in the url and gives a clean url to work on
    //example if the path is like /get-api/food/ or get-api/food (for the server both are same)
    //after trimming both will become get-api/food (replacing slashes with blank/nothing but do nothing
    //if the slashes in the middle)
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //Read Headers
    var urlHeaders = req.headers;

    //Read the Payload
    /*
    Now one interesting thing about payload is that payloads don't come all at once, instead they
    come in peices. So, in order to read the complete payload we need to collect the payload content
    untill the payload has been recieved completely and then work accordingly. This is achieved using
    two event handlers (data) and (end).
    The data event handler will capture the payload data if it exists and the end handler will mark
    that the payload has been recieved completely.
    One thing to note in this is that the (end) handler is same as the one used as res.end() and it
    also works like that.
    Example of a request with payload / body is
    http://localhost:3000/new-data   -> url
    {
        "name" : "rishabh",
        "surname": "Kalra"
    }                               -> body data

    the request from the client will be like http.post(url, data);
    */

    var decoder = new stringDecoder('utf-8');
    var bufferPayload = '';

    //event handler when some data is recieved in the payload / body
    req.on('data', (data) => {
        //this usually writes the complete payload at once but sometimes in case of multiple payloads
        //it takes time to write all of that. The below lines handle both the cases by appending
        bufferPayload += decoder.write(data);
    });

    //event handler when the request is finished sending information
    //NOTE : same type of event is read by res.end() also.
    req.on('end', () => {
        bufferPayload += decoder.end();

        //ROUTE TO A SPECIFIC HANDLER BASED ON ROUTING OBJECT, ROUTE TO NOTFOUND IF NOT FOUND
        var selectedHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? handlers[trimmedPath] : handlers.notFound;
        //once the handler is specified, we need to send some data to it as expected by the handler
        var data  = {
            'headers': urlHeaders,
            'method': method,
            'pathname': trimmedPath,
            'payload': helpers.convertJSONstr2JSON(bufferPayload),
            'queryString': queryObject
        }
        //send the data and look for callback
        selectedHandler(data, (statusCode, payload, contentType) => {
            //send a default status code of 200 if no status code is defined
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            contentType = typeof(contentType) == 'string' ? contentType : 'json';
            //add a specific format in which the data is to be sent to the client
            //NOTE : You cannot set header after writing the head, it will throw an error
            //best practice is to always set the headers first and then do everything else

            if(contentType == 'json'){
                payload = typeof(payload) == 'object' ? JSON.stringify(payload) : JSON.stringify({});
                res.setHeader('Content-Type', 'application/json');
            }
            if(contentType == 'html'){
                payload = typeof(payload) == 'string' ? payload : 'plain text returned';
                res.setHeader('Content-Type', 'text/plain');
            }
            //now returning the res to the client according to the statusCode and payload recieved from the handler
            res.writeHead(statusCode);
            
            //SEND THE RESPOSE FROM THE SERVER
            res.end(payload);
            
            //LOG IF YOU NEED TO THE CONSOLE
            if(statusCode == 200){
                //display in green
                console.log('\x1b[32m%s\x1b[0m',"response on ", method +" " +trimmedPath, " ->", statusCode);       
            }
            else {
                //for any non 200 status, display in red
                console.log('\x1b[31m%s\x1b[0m',"response on ", method +" " +trimmedPath, " ->", statusCode);
            }
        });
    });
};

//DEFINING ROUTERS AND THEIR HANDLERS

/* 
*A routing technique is a way to route the incomingrequests to specific handlers. This is usefull
*to define a specific functionality according to a specific request. For example, if a route is of
*sampler type, then a specific handler defined for sampler will be called.
*/

//defining a router
server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};

//intitialise the server file
server.init = ()=>{
    //this line actually starts the server, now when the port opens you will see the 
    //below text on the screen. To be able to access the port you can write
    server.httpServer.listen(config.httpPort, function(){
        console.log('\x1b[36m%s\x1b[0m',"the server is listening on port "+config.httpPort + " ["+config.envName+"] ");
    });

    server.httpsServer.listen(config.httpsPort, function(){
        console.log('\x1b[35m%s\x1b[0m',"the server is listening on port "+config.httpsPort + " ["+config.envName+"] ");
    });
};

module.exports = server;