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
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;

    //if queryString is provided, construct a url from those queryString
    let requestUrl = path;
    let counter = 0;
    for(queryKey in queryStringObject){
        if(queryStringObject.hasOwnProperty(queryKey)){
            //add & if there is atleast one query parameter present in the url
            if (counter == 0){
                requestUrl += '?';
            }
            if(counter > 0){
                requestUrl += '&';
            }
            requestUrl += queryKey + '=' + queryStringObject[queryKey];
            counter++;
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
        xhr.setRequestHeader("token", app.config.sessionToken);
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
    if(document.querySelector("form")){
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

        //now call the API to submit the form
        app.client.request(undefined, path, method, undefined, payload, (statusCode, responsePayload)=>{
            if(statusCode !== 200){
                let errorText = typeof(responsePayload) == 'object' ? responsePayload.Error : 'An error occured while submitting';
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
    }
};

//Form response processor will handle the redirections after form submits
app.formResponseProcessor = (formid, reqPayload, resPayload)=>{
    if(formid == 'accountCreate'){
        let newPayload = {
            "phone" : reqPayload.phone,
            "password" : reqPayload.password
        }

        //to log in the user after registration, call the token api, get the token and set in ls
        app.client.request(undefined, 'api/tokens', 'POST',undefined, newPayload, (statusCode, newRespayload)=>{
            if(statusCode !== 200){

                let errorText = 'An error occured while redirecting to dashboard';
                //set the error
                document.querySelector('[name=errorBox]').innerHTML = errorText + ' ('+statusCode+')';
                //display the error
                document.querySelector('[name=errorBox]').style.display = 'block';
            }
            else {
                if(app.setSessionToken(newRespayload)){
                    //after setting the token to local storage, take him to dashboard
                    window.location = '/checks/all';
                }
            }
        });
    }
    if(formid == 'sessionCreate'){
        //successfull login will set and redirect to dashboard
        if(app.setSessionToken(resPayload)){
            console.log("successfully set token")
            window.location = '/checks/all';
        }
    }
};

//get token from the local storage
app.getSessionToken = ()=>{
    let tokenString = localStorage.getItem('token');
    if(typeof(tokenString) == 'string'){
        try{
            let token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if(typeof(token) !== 'undefined'){
                console.log("logged in")
                app.setLoggedInClass(true);
            }
            else {
                console.log("logged out")
                app.setLoggedInClass(false);
            }
        }
        catch(e){
            console.log("error while getting token from ls ", e);
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

//set token to the local storage and mark as logged in
app.setSessionToken = (tokenPayload)=>{
    app.config.sessionToken = tokenPayload.id;
    let stringToken = JSON.stringify(tokenPayload.id);
    if(stringToken !== 'undefined'){
        localStorage.setItem('token', stringToken);
        if(typeof(tokenPayload) == 'object'){
            app.setLoggedInClass(true);
            return true;
        }
        else {
            app.setLoggedInClass(true);
            return false;
        }
    }
    else {
        console.log("no user")
    }
}

//add logged in class to html based on session
app.setLoggedInClass = (add)=>{
    var target = document.querySelector("body");
    if(add){
      target.classList.add('loggedIn');
    } else {
      target.classList.remove('loggedIn');
    }
  };

  // Loop to renew token often
app.tokenRenewalLoop = ()=>{
    setInterval(()=>{
      app.renewToken((err)=>{
        if(!err){
          console.log("Token renewed successfully @ "+Date.now());
        }
      });
    },1000 * 60);
  };

  //logic to renew token
  app.renewToken = (callback)=>{
      let currentToken = typeof(app.config.sessionToken) == 'string' ? app.config.sessionToken:false;
      if(currentToken){
          let payload = {
              "id": currentToken,
              "extend": true
          }
          app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, (statusCode, resPayload)=>{
            if(statusCode == 200){
                let queryString = {}
                queryString.id = currentToken;
                app.client.request(undefined, 'api/tokens', 'GET', queryString, undefined, (statusCode, resPayload)=>{
                    if(statusCode == 200){
                        if(app.setSessionToken(resPayload)){
                            callback(false);
                        }
                        else {
                            console.log("failed to set updated token in ls")
                            app.setSessionToken(false)
                            callback(true);    
                        }
                    }
                    else {
                        console.log("error while getting extended token")
                        app.setSessionToken(false)
                        callback(true);
                    }
                });
            }           
            else {
                console.log("error while sending extend update request")
                app.setSessionToken(false)
                callback(true);
            } 
          });
      }
      else {
          console.log("no cuurent token reported")
          app.setSessionToken(false);
          callback(true);
      }
  };

  //logic to logout user
  app.bindLogOut = ()=>{
      let buttonEl = document.querySelector('[id=logoutButton]');
      buttonEl.addEventListener("click", (e)=>{
          //prevent the default redirection and initiate logout procedure
          e.preventDefault();
          app.logoutSession();
      });
  };

  app.logoutSession = ()=>{
      let token = typeof(app.config.sessionToken) == 'string' && app.config.sessionToken.length > 0 && app.config.sessionToken !== 'undefined' ? app.config.sessionToken : false;

      if(token){
        //here we will make a API call to delete a session token and then remove it from the LS
        let payload = {}
        payload.id = token;
        app.client.request(undefined, 'api/tokens', 'DELETE', undefined, payload, (statusCode, resPayload)=>{
            if(statusCode !== 200){
                //display error that unable to logout from the server
            }
            else {
                localStorage.clear();
                app.setLoggedInClass(false);
                window.location = '/session/deleted';
            }
        });
      }
      else {
          //display error stating unable to log out due to some reason
      }
  };

//init function to execute
app.init = ()=>{
    console.log("app.init")
    //bind all the forms in the page
    app.bindForms();
    app.getSessionToken();
    app.tokenRenewalLoop();
};

//execute the init
window.onload = ()=>{
    app.init();
};