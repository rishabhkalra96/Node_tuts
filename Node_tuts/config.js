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
    'httpPort': process.env.PORT || 3000,
    'httpsPort': process.env.PORT || 3001,
    'envName': "staging",
    'hashingSecret': "ObviouslyASecret",
    'maxChecks': 5,
    'twilio' : {
        'fromPhone': +919971696729,
        'fromPhoneOK': +15005550006,
        'sid': 'AC2dc051e81b708fa2e98a76bd1bfcb6e6',
        'auth': '5242098a97503afe35c3e2faa04f2e68',
        'sidOK': 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authOK': '9455e3eb3109edc12e3d8c92768f7a67'
    },
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'Dummy-Company',
        'yearCreated': '2018',
        'baseUrl': 'http://0.0.0.0:'+process.env.PORT+'/'
    }
};

//configuration for production
environments.production = {
    'httpPort':process.env.PORT || 5000,
    'httpsPort':process.env.PORT || 5001,
    'envName': "production",
    'hashingSecret': "ObviouslyASecretAgain",
    'maxChecks': 5,
    'twilio' : {
        'fromPhone': +919971696729,
        'fromPhoneOK': +15005550006,
        'sid': 'AC2dc051e81b708fa2e98a76bd1bfcb6e6',
        'auth': '5242098a97503afe35c3e2faa04f2e68',
        'sidOK': 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authOK': '9455e3eb3109edc12e3d8c92768f7a67'
    },
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'Dummy-Company',
        'yearCreated': '2018',
        'baseUrl': 'http://localhost:5000/'
    }
};

//detect if user entered any environment argument on the command line
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string'? process.env.NODE_ENV.toLowerCase() : '';

//assign respective environment configuration or just assign staging by default if no or invalid args are passed
var environmentExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging; 

module.exports = environmentExport;