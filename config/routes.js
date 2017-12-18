
module.exports = function(app,fs,xml2js,os,uniqid) {

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



};
