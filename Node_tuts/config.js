/*
A common config file to identify staging and prodution
*/

var environments = {};

//configuration for staging
environments.staging = {
    'port': 3000,
    'envName': "staging"
};

//configuration for production
environments.production = {
    'port': 4200,
    'envName': "production"
};

//detect if user entered any environment argument on the command line
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string'? process.env.NODE_ENV.toLowerCase() : '';

//assign respective environment configuration or just assign staging by default if no or invalid args are passed
var environmentExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging; 

module.exports = environmentExport;