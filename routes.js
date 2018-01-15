const express = require('express');
const routes = express();
var http = require('http');
var server = http.createServer(routes);

routes.use(express.static('public'));

var result =0;
routes.get('/hi', function(req, res) {
        result ++;
        res.send("Hi "+result);
});




server.listen(8080);