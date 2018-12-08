// dependencies
var express = require('express');
var https = require('https');
var fs = require("fs");
const bodyParser = require('body-parser');

// require the jsonwebtoken library for creating tokens
var jwt = require('jsonwebtoken');

// you need to have a .env file with your database 
// connection string and encryption key
// see .env_sample for a starting point.
require('dotenv').config();

// the authentication model class, uses mongo db 
// to authenticate a client
var model = require("./models/auth_model.js");

// Initialize express and use the bodyparser for 
// getting http post body data.
var app = express();
app.use(bodyParser.urlencoded());

// just a generic home page for a web portal if desired.
app.get('/', function(req,res){
    res.send("TokenServer");
});

// an API route for the authorization/authentication step
app.post('/authorize', function (req, res) {

    // get the client_id and secret from the client application
    var client_id = req.body.client_id;
    var client_secret = req.body.client_secret;  

    // authorize with the model, using promises
    model.authorize(client_id, client_secret).then(function(docs){

        var token_response = {};
        token_response.success = false;

        // if we have a user with the passed client_id and client_secret
        // then create a token
        if(docs && docs.length > 0){
            token_response.client_id = docs[0].client_id;
            token_response.success = true;

            // sign the token and add it to the response object
            var token = jwt.sign(token_response, process.env.SECRET);
            token_response.token = token;
        }

        // return the token back to the client application
        res.send(token_response);
    }).catch(function(err){

        // error handling goes here
        res.send(err);
    });
});

// this is an API call to verify the access_token when it's passed
app.post('/verify', function (req, res) {
    
    // get the token that was passed in the app.
    // might make more sense to put this in the header
    var token = req.header.authorization;

    // decode the token to verify
    var decoded = jwt.verify(token, process.env.SECRET, function(err, decoded){
        if(err){
            // if there is an error, the token is not valid!
            res.send({success:false});
        } else {
            // if no error, send the decoded token to the client with
            // authorization metadata payload
            res.send(decoded);
        }
    });
});

// file location of private key
var privateKey = fs.readFileSync( 'private.key' );

// file location of SSL cert
var certificate = fs.readFileSync( 'SSL.crt' );

// set up a config object
var server_config = {
    key : privateKey,
    cert: certificate
};

// create the server
var https_server = https.createServer(server_config, app).listen(2600, function(err){
    console.log("Node.js Express HTTPS Server Listening on Port 2600");
});