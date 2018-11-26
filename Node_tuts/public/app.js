/*
*   Frontend logic for the application
*/


//container for front end application
app = {}


//config
app.config = {
    'sessionToken': false
}

//AJAX frontend client for restfull API requests
app.client = {}

//interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback)=>{

    //setting the deafaults
    headers = typeof(headers) == 'object' && headers !== null ? headers : {};
    path = typeof(path) == 'string'? path : '/';
    method = typeof(method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
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

//Bind the forms
app.bindForms = ()=>{
    //select the form
    let form = document.querySelector("form");

    form.addEventListener("submit", (e)=>{
        //stop immediate submitting the form
        e.preventDefault();

        let formId = form.id;
        let path = form.action;
        let method = form.method.toUpperCase();

        //hide the error message, if one is already shown
        document.querySelector('[name=errorBox]').style.display = 'hidden';

        //convert the form data into payload
        let payload = {}
        let elements = form.elements;

        for(var i = 0 ; i < elements.length ; i++){
            if(elements[i].type !== 'submit'){
                let valueOfelement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
                payload[elements[i].name] = valueOfelement;
            }
        }
        console.log("payload now is ->", payload);

        //now call the API to submit the form
        app.client.request(undefined, path, method, undefined, payload, (statusCode, responsePayload)=>{
            if(statusCode !== 200){
                let errorText = typeof(responsePayload) == 'string' ? responsePayload.Error : 'An error occured while submitting';
                //set the error
                document.querySelector('[name=errorBox]').innerHTML = errorText + ' ('+statusCode+')';
                //display the error
                document.querySelector('[name=errorBox]').style.display = 'block';
            }
            else {
                //everything ok, call the form processor
                app.formResponseProcessor(formId, payload, responsePayload);
            }
        });
    });
};

//Form response processor will handle the redirections after form submits
app.formResponseProcessor = (formid, reqPayload, resPayload)=>{
    if(formid == 'accountCreate'){
        //@TODO : redirect on successfull creation
    }
};

//inti function to execute
app.init = ()=>{
    //bind all the forms in the page
    app.bindForms();
};

//execute the init
window.onload = ()=>{
    app.init();
};