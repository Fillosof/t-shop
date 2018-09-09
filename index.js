/*************************************
t-shop

main file, just basic connections and router handlers
started: 30/08/18


*************************************/




const http = require('http');
const https = require('https');
const urlParser = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const mongoose = require('mongoose');
var config = require('./config');

// ENV variables and Constants
const decoder = new StringDecoder('utf-8');


// connection to Cloud DB
mongoose.connect('mongodb+srv://t-shop:1010shop@cluster0-tqktf.gcp.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected to Cloud DataBase!");
});

// test db schema 


const livingThingShema = new mongoose.Schema({
    name: String
  });
  livingThingShema.methods.speak = function () {
    const greeting = this.name
        ? `Greetings, I am ${this.name}, and I can speak!!!`
        : "I am the Chaos and Destruction :-D";
    console.log(greeting);
}
const Thing = mongoose.model('Thing', livingThingShema);


// server handler
const mainHandler = (req, res) => {
    const urlObj = urlParser.parse(req.url, true);
    // basic elements of request
    const headers = req.headers;
    const method = req.method.toLowerCase();
    const path = urlObj.pathname.replace(/^\/+|\/+$/g, '');
    const query = urlObj.query;

    let dataBuffer = '';

    req.on('data', (data) => dataBuffer += decoder.write(data));
    req.on('end', () => {
        dataBuffer += decoder.end();
        const data = { headers, method, path, query, payload: dataBuffer };
        const currentHandler = (routes[path]) ? routes[path] : handlers.notFound;
        currentHandler(data, (statusCode, resPayload) => {
            // checking statusCode and resPayload
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
            resPayload = typeof(resPayload) === 'object' ? resPayload : {};

            // sending response to user
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            const resPayloadString = JSON.stringify(resPayload);
            res.end( resPayloadString );
            console.log('Our response', statusCode, resPayloadString );
        })
    })


}
const handlers = {};
//handlers pass back (statusCode, data)

handlers.test = (data, callback) => {
    data.testResult = 'this is test data';
    const createNewThing = async () => {
        data.payload = JSON.parse(data.payload);
        const something = new Thing({ name: data.payload.name });
        await something.save((err, something) => {
            if (err) return console.error(err);
            something.speak();
            callback(401, something);
        });
    }
    const getAllThings = async () => {
        Thing.find(function (err, things) {
            if (err) return console.error(err);
            console.log(things);
            callback(200, things);
        })
    }
    switch (data.method) {
        case 'post':
            createNewThing();
            break;
        case 'get':
            getAllThings();
            break;
        default:
            callback(404);
            break;
    }

}

handlers.notFound = (data, callback) => {
    callback(404);
}

const routes = {
    test: handlers.test
}

// Creating and starting server
const httpServer = http.createServer(mainHandler);
httpServer.listen(config.httpPort, ()=> console.log(`Server started and listening port: ${config.httpPort} in ${config.envName} mode`));

const httpsServerOptons = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
}
const httpsServer = https.createServer( httpsServerOptons, mainHandler);
httpsServer.listen(config.httpsPort, ()=> console.log(`Server started and listening port: ${config.httpsPort} in ${config.envName} mode`));
