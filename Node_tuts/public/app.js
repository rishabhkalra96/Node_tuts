/*
*   Frontend logic for the application
*/


//container for front end application
app = {}


//config
app.config = {
    'sessionToken': false
}

//AJAX client for restfull API requests
app.client = {}

//interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback)=>{

    //setting the deafaults
    headers = typeof(headers) == 'object' && headers !== null ? headers : {};
    path = typeof(path) == 'string'? path : '/';
    method = typeof(method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 && method instanceof Array ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) == 'string' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;

    //if queryString is provided, construct a url from those queryString
    let requestUrl = path+'?';
    let counter = 0;
    for(queryKey in queryStringObject){
        if(queryStringObject.hasOwnProperty(queryKey)){
            counter++;
            //add & if there is atleast one query parameter present in the url
            if(counter > 0){
                requestUrl += '&';
            }
            requestUrl += queryKey + '=' + queryStringObject[queryKey];
        }
    }

    //form JSON HTTP request
    let xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);

    //add json header
    xhr.setRequestHeader('Content-Type', 'application/json');

    //add subsequent headers to the above one
    for(headerKey in headers){
        if(headers.hasOwnProperty(headerKey)){
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    //if session is active, add that too in the headers
    if (app.config.sessionToken){
        xhr.setRequestHeader("token", app.config.sessionToken.id);
    }

    //handle the response when the request comes back
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState == XMLHttpRequest.DONE){
            let statusCode = xhr.status;
            let responseReturned = xhr.responseText;
        
            //send the callback, if provided
            if(callback){
                try{
                    let parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse)
                }
                catch(e){
                    //send only statuscode to the callback
                    callback(statusCode, false);
                }
            }
        }
    }

    //send the request
    let payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
};

//