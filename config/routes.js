
module.exports = function(app,fs,xml2js,os,uniqid) {


    app.get('/getTheme', function(req, res) {
            var xml = fs.readFileSync('xml/window-settings.xml');
            var parser = new xml2js.Parser();
            parser.parseString(xml, function(err,result){
            res.send(result.currtheme)
        });
    });

    app.get('/setTheme', function(req, res) {
        var xml = fs.readFileSync('xml/window-settings.xml');
        var parser = new xml2js.Parser();
        parser.parseString(xml, function(err,result) {
            if (req.query.theme>0 && req.query.theme<=10) {
                result.currtheme = req.query.theme;
                var builder = new xml2js.Builder();
                xml = builder.buildObject(result);
                fs.writeFile('xml/window-settings.xml', xml);
                res.send(req.query.theme);
            }
            else{
                res.send("problem");
            }
        });
    });

    app.get('/addPath', function(req, res) {
        var xml = fs.readFileSync('xml/paths.xml');
        var parser = new xml2js.Parser();
        var trovato="0";
        parser.parseString(xml, function(err,result) {
            if (fs.existsSync(req.query.path) && fs.lstatSync(req.query.path).isDirectory()){
                for(k in result.pathlist.path){
                    if (result.pathlist.path[k].folder == req.query.path) {
                        trovato="1";
                    }
                }
                if(trovato=="1")
                {
                    res.send("2");
                }
                else
                {
                    var newPath;
                    if(result.pathlist.length==0)
                    {
                        newPath = { path:[{idPath: uniqid('folder-'),ip: "localhost", username: os.userInfo().username, folder: req.query.path}]};
                        result.pathlist=newPath;
                    }else {
                        newPath = {idPath: uniqid('folder-'),ip: "localhost", username: os.userInfo().username, folder: req.query.path};
                        result.pathlist.path.push(newPath);
                    }
                    var builder = new xml2js.Builder();
                    xml = builder.buildObject(result);
                    fs.writeFile('xml/paths.xml', xml);
                    res.send("1");
                }
            }
            else{
                res.send("0");
            }
        });
    });

    app.get('/getUserInfo', function(req, res) {
        var interfaces = os.networkInterfaces();
        var addresses = [];
        addresses.push(os.userInfo().username);
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }
        if(addresses[1]==undefined)
            addresses.push("Non connesso ad internet")
        res.send(JSON.stringify(addresses));
    });

    app.get('/stream', function(req, res) {
        var path = req.query.path+"/"+req.query.source;
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
            console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

            var file = fs.createReadStream(path, {start: start, end: end});
            res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
            file.pipe(res);

        } else {
            console.log('ALL: ' + total);
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
            fs.createReadStream(path).pipe(res);
        }
    });

    app.get('/getFolderList', function(req, res) {
        var paths = [];
        var xml = fs.readFileSync('xml/paths.xml');
        var parser = new xml2js.Parser();
        parser.parseString(xml, function(err,result) {
            if(result.pathlist.length!=0)
            {
                result.pathlist.path.forEach(function (element) {
                    paths.push(element)
                });
            }
                res.send(JSON.stringify(paths));
         });
    });

    app.get('/deletePath', function(req, res) {
        var xml = fs.readFileSync('xml/paths.xml');
        var parser = new xml2js.Parser();
        var trovato="0";
        if (req.query.idPath==null || req.query.idPath=="") {
            res.send(trovato);
        }
        else {
            parser.parseString(xml, function (err, result) {
                for(k in result.pathlist.path){
                    if (result.pathlist.path[k].idPath == req.query.idPath) {
                        trovato="1";
                        delete result.pathlist.path[k];
                    }
                }
                if(trovato=="1")
                {
                    var builder = new xml2js.Builder();
                    xml = builder.buildObject(result);
                    fs.writeFile('xml/paths.xml', xml);
                }
                res.send(trovato);
            });
        }
    });
};
