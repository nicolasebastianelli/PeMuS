
module.exports = function(app,fs,xml2js,os) {
    app.get('/data', function(req, res) {
        res.redirect('data-table.html')
    });

    app.get('/getTheme', function(req, res) {
            var xml = fs.readFileSync('xml/window-settings.xml');
            var parser = new xml2js.Parser();
            parser.parseString(xml, function(err,result){
            res.send(result['currtheme'])
        });
    });

    app.get('/setTheme', function(req, res) {
        req.query.theme
        var xml = fs.readFileSync('xml/window-settings.xml');
        var parser = new xml2js.Parser();
        parser.parseString(xml, function(err,result) {
            if (req.query.theme>0 && req.query.theme<=10) {
                result['currtheme'] = req.query.theme;
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

    app.get('/getUserInfo', function(req, res) {
        var ifaces = os.networkInterfaces();
        var result="";
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
};
