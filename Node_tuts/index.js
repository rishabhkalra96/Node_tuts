/*
*This is the primary file for API requests
*
*/

//the purpose is to setup an http connection on port 3000

//Dependencies
//adding a pre built module http so that we can create and listen to http requests
const http = require('http');
//a built in module from node named url which is used to parse / read urls the user requests
//url parsing is done inside the callback function of createserver
var url = require('url');

//creating a server from the http module which defines what to do when the server is created
const server = http.createServer(function(req, res){
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
    //SEND THE RESPONSE
    res.end("HELLO WORLD FROM THE SERVER\n");

    //LOG IF YOU NEED TO THE CONSOLE
    console.log("headers as ->", urlHeaders);
});

//this line actually starts the server on port 3000, now when the port opens you will see the 
//below text on the screen. To be able to access the port you can write
// curl localhost:3000 and whatever the output is set in res.end(), you will see that
server.listen(3000, function(){
    console.log("the server is listening on port 3000");
});