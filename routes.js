const express = require('express');
const routes = express();
const http = require('http');
const server = http.createServer(routes);
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
const os = require('os');
const port =process.env.PORT;

routes.use(express.static('public'));

routes.get('/stream', function(req, res) {
    let path  = decodeURIComponent(req.query.source.toString()).replace(/\s+/g, " ");
    let stat = fs.statSync(path);
    let total = stat.size;

    if (req.headers.range) {   // meaning client (browser) has moved the forward/back slider
        // which has sent this request back to this server logic ... cool
        let range = req.headers.range;
        let parts = range.replace(/bytes=/, "").split("-");
        let partialstart = parts[0];
        let partialend = parts[1];

        let start = parseInt(partialstart, 10);
        let end = partialend ? parseInt(partialend, 10) : total-1;
        let chunksize = (end-start)+1;

        let file = fs.createReadStream(path.toString(), {start: start, end: end});
        res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
        file.pipe(res);

    } else {
        res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        fs.createReadStream(path.toString()).pipe(res);
    }
});

routes.get('/available', function(req, res) {
    let path  = decodeURIComponent(req.query.source.toString()).replace(/\s+/g, " ");
    res.send(fs.existsSync(path));
});

routes.get('/getCurrentTheme', function(req, res) {
    let xml = fs.readFileSync('client/xml/settings.xml');
    let parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        res.send(result.settings.currtheme.toString());
    });
});

routes.get('/getUser', function(req, res) {
    res.send(os.userInfo().username);
});

routes.get('/getVideoList', function(req, res) {
    let xml = fs.readFileSync('client/xml/paths.xml');
    let parser = new xml2js.Parser();
    let videoList =[];
    parser.parseString(xml, function (err, result) {
        for (let k in result.pathlist.path) {
            fromDir(result.pathlist.path[k].folder.toString(),videoList,".mp4");
        }
    });
    res.send(JSON.stringify(videoList))
});

routes.get('/getMusicList', function(req, res) {
    let xml = fs.readFileSync('client/xml/paths.xml');
    let parser = new xml2js.Parser();
    let videoList =[];
    parser.parseString(xml, function (err, result) {
        for (let k in result.pathlist.path) {
            fromDir(result.pathlist.path[k].folder.toString(),videoList,".mp3");
        }
    });
    res.send(JSON.stringify(videoList))
});

function fromDir(startPath,res,fileType){
    let files=fs.readdirSync(startPath);
    for(let i=0;i<files.length;i++){
        let filename=path.join(startPath,files[i]);
        try {
            let stat = fs.lstatSync(filename);
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