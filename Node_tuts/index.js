/*
* This is the primary file for API requests
* 
* NOTE : 
* If you are using config file then to build in production mode (localhost:4200) write,
*                NODE_ENV=production node index.js
* for staging (localhost:3000), simply write
*               node index.js
* By default the app starts in staging 
*/


//importing the configuration
const config = require('./config');

//Dependencies
//adding a pre built module http/https so that we can create and listen to http requests
const http = require('http');
const https = require('https');
//file system support to read files
var fs = require('fs');
//a built in module from node named url which is used to parse / read urls the user requests
//url parsing is done inside the callback function of createserver
var url = require('url');

//importing the handlers
var handlers = require('./lib/handlers');

//importing helpers
var helpers = require('./lib/helpers');

//To read Payload
var stringDecoder = require('string_decoder').StringDecoder;
//creating a server from the http module which defines what to do when the server is created
const httpServer = http.createServer(function(req, res){
    unifiedServer(req, res);
});
//creating a server from the https module which defines what to do when the server is created
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key-pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, function(req, res){
    unifiedServer(req, res);
});


//this line actually starts the server, now when the port opens you will see the 
//below text on the screen. To be able to access the port you can write
// curl localhost:portnumner
httpServer.listen(config.httpPort, function(){
    console.log("the server is listening on port",config.httpPort, " [",config.envName,"] ");
});

httpsServer.listen(config.httpsPort, function(){
    console.log("the server is listening on port",config.httpsPort, " [",config.envName,"] ");
});



unifiedServer = function(req,res){
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
        var selectedHandler = typeof(router[trimmedPath]) !== 'undefined' ? handlers[trimmedPath] : handlers.notFound;
        //once the handler is specified, we need to send some data to it as expected by the handler
        var data  = {
            'headers': urlHeaders,
            'method': method,
            'pathname': trimmedPath,
            'payload': helpers.convertJSONstr2JSON(bufferPayload),
            'queryString': queryObject
        }
        //send the data and look for callback
        selectedHandler(data, (statusCode, payload) => {
            //send a default status code of 200 if no status code is defined
            var statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            //send a default payload of empty {} if no payload is defined
            var payload = typeof(payload) == 'object' ? JSON.stringify(payload) : JSON.stringify({});

            //add a specific format in which the data is to be sent to the client
            //NOTE : You cannot set header after writing the head, it will throw an error
            //best practice is to always set the headers first and then do everything else
            res.setHeader('Content-Type', 'application/json');
            
            //now returning the res to the client according to the statusCode and payload recieved from the handler
            res.writeHead(statusCode);
            
            //SEND THE RESPOSE FROM THE SERVER
            res.end(payload);
            
            //LOG IF YOU NEED TO THE CONSOLE
            console.log("response on ", trimmedPath, " ->", statusCode, ",",payload);
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
var router = {
    'ping': handlers.ping,
    'users': handlers.users
};
