var express = require('express');
var routes = express();
var http = require('http');
var server = http.createServer(routes);
var fs = require('fs');

routes.use(express.static('public'));

routes.get('/hi', function(req, res) {
        res.send('hi');
});


routes.get('/stream', function(req, res) {
    var path  = Buffer.from(req.query.source.toString(), 'hex').toString('utf8').replace(/\s+/g, " ");
    var stat = fs.statSync(path);
    var total = stat.size;

    if (req.headers.range) {   // meaning client (browser) has moved the forward/back slider
        // which has sent this request back to this server logic ... cool
        var range = req.headers.range;
        var parts = range.replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total-1;
        var chunksize = (end-start)+1;

        var file = fs.createReadStream(path.toString(), {start: start, end: end});
        res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
        file.pipe(res);

    } else {
        res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        fs.createReadStream(path.toString()).pipe(res);
    }
});

routes.get('/available', function(req, res) {
    var path  = Buffer.from(req.query.source.toString(), 'hex').toString('utf8').replace(/[^\u000A\u0020-\u007E]/g, ' ');
    res.send(fs.existsSync(path));
});




server.listen(8080);