/*
A common config file to identify staging and prodution

NOTE : If you are using config file then to build in production mode (localhost:4200 or 4201) write,
               NODE_ENV=production node index.js
for staging (localhost:3000 or 3001), simply write
              node index.js
By default the app starts in staging
*/

var environments = {};

//configuration for staging
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': "staging",
    'hashingSecret': "ObviouslyASecret"
};

//configuration for production
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': "production",
    'hashingSecret': "ObviouslyASecretAgain"
};

//detect if user entered any environment argument on the command line
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string'? process.env.NODE_ENV.toLowerCase() : '';

//assign respective environment configuration or just assign staging by default if no or invalid args are passed
var environmentExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging; 

module.exports = environmentExport;