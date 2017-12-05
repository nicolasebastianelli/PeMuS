var express = require('express');
var fs = require('fs');
var http = require('http');
var xml2js = require('xml2js');
var os = require('os');
var uniqid = require('uniqid');
var app = express();
var server = http.createServer(app);

require('./config/environment.js')(app, express);
require('./config/routes.js')(app,fs,xml2js,os,uniqid);

server.listen(4242);