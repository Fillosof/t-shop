/*************************************
Create and exports configuration variables

started: 09/09/18


*************************************/

// container for all var
const environment = {};

// Default ENV
environment.dev = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'dev',


}

// Production ENV

environment.prod = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'prod',
}

// switching env depends of parameter NODE_ENV

const currentEnv = process.env.NODE_ENV ? process.env.NODE_ENV.toLocaleLowerCase() : '';
console.log(currentEnv);
console.log(environment['prod']);

const envToExport = typeof(environment[currentEnv]) == 'object' ? environment[currentEnv] : environment.dev;
console.log(envToExport);

module.exports = envToExport;