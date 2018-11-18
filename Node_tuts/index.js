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

//DEPENDENCIES
var server = require('./lib/server');
var worker = require('./lib/worker');

//declarations
let app = {};

//initi function
app.init = ()=>{
    server.init();
    console.log('server initiated')
    worker.init();
};


//executing the main init function
app.init();

//exporting the app
module.exports = app;