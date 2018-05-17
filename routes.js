var express = require('express');
var routes = express();
var http = require('http');
var server = http.createServer(routes);
var fs = require('fs');
var xml2js = require('xml2js');
var path = require('path');
var os = require('os');
var port =process.env.PORT;

routes.use(express.static('public'));

routes.get('/stream', function(req, res) {
    var path  = decodeURIComponent(req.query.source.toString()).replace(/\s+/g, " ");
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
    var path  = decodeURIComponent(req.query.source.toString()).replace(/\s+/g, " ");
    res.send(fs.existsSync(path));
});

routes.get('/getCurrentTheme', function(req, res) {
    var xml = fs.readFileSync('client/xml/settings.xml');
    var parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        res.send(result.settings.currtheme.toString());
    });
});

routes.get('/getUser', function(req, res) {
    res.send(os.userInfo().username);
});

routes.get('/getVideoList', function(req, res) {
    var xml = fs.readFileSync('client/xml/paths.xml');
    var parser = new xml2js.Parser();
    var videoList =[];
    parser.parseString(xml, function (err, result) {
        for (k in result.pathlist.path) {
            fromDir(result.pathlist.path[k].folder.toString(),videoList,".mp4");
        }
    });
    res.send(JSON.stringify(videoList))
});

routes.get('/getMusicList', function(req, res) {
    var xml = fs.readFileSync('client/xml/paths.xml');
    var parser = new xml2js.Parser();
    var videoList =[];
    parser.parseString(xml, function (err, result) {
        for (k in result.pathlist.path) {
            fromDir(result.pathlist.path[k].folder.toString(),videoList,".mp3");
        }
    });
    res.send(JSON.stringify(videoList))
});

function fromDir(startPath,res,fileType){
    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        try {
            var stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                fromDir(filename, res,fileType);
            }
            else if (filename.indexOf(fileType) >= 0) {
                res.push(filename);
            }
        }
        catch (err){ console.log("Errore navigazione path: "+err);}
    }
}

server.listen(port);