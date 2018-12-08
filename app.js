// dependencies
var express = require('express');
var https = require('https');
var fs = require("fs");
require('dotenv').config();
var model = require("./models/auth_model.js");
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.urlencoded());

app.get('/', function(req,res){
    res.send("TokenServer");
});

app.post('/authorize', function (req, res) {

    var client_id = req.body.client_id;
    var client_secret = req.body.client_secret;  

    model.authorize(client_id, client_secret).then(function(docs){

        var token_response = {};
        token_response.success = false;

        if(docs && docs.length > 0){
            token_response.client_id = docs[0].client_id;
            token_response.success = true;
            var token = jwt.sign(token_response, process.env.SECRET);
            token_response.token = token;
        }

        res.send(token_response);
    }).catch(function(err){
        res.send(err);
    });
});

app.post('/verify', function (req, res) {
    var token = req.body.token;
    var decoded = jwt.verify(token, process.env.SECRET, function(err, decoded){
        if(err){
            res.send({success:false});
        }else {
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

var https_server = https.createServer(server_config, app).listen(2600, function(err){
    console.log("Node.js Express HTTPS Server Listening on Port 2600");
});