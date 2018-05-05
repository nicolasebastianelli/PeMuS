var fs = require('fs');
var xml2js = require('xml2js');
var os = require('os');

function updateTheme() {
    var xml = fs.readFileSync('client/xml/settings.xml');
    var parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        document.getElementsByTagName("body")[0].setAttribute("data-sa-theme", result.currtheme);
        document.getElementById("label-theme-" + result.currtheme).className += " active"
        document.getElementById("theme-" + result.currtheme).checked = true;

    });
}

function setTheme(id) {
    var xml = fs.readFileSync('client/xml/settings.xml');
    var parser = new xml2js.Parser();
    parser.parseString(xml, function(err,result) {
        if (document.getElementById(id).getAttribute("value")>0 && document.getElementById(id).getAttribute("value")<=10) {
            result.currtheme = document.getElementById(id).getAttribute("value");
        }
        else{
            result.currtheme="1";
        }
        var builder = new xml2js.Builder();
        xml = builder.buildObject(result);
        fs.writeFileSync('client/xml/settings.xml', xml);
    });
}

function getUserInfo() {
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
        addresses.push("Not connected to internet")
    return addresses;
}

function updateUser() {
    var addresses = getUserInfo();
    document.getElementById("ip").innerHTML=addresses[1];
    document.getElementById("user").innerHTML=addresses[0];

}