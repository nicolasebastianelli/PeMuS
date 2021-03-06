const fs = require('fs');
const xml2js = require('xml2js');
const os = require('os');
const uniqid = require('uniqid');
const dialog = require('electron').remote.dialog;
const port =process.env.PORT;

function updateTheme() {
    let xml = fs.readFileSync('client/xml/settings.xml');
    let parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        document.getElementsByTagName("body")[0].setAttribute("data-sa-theme", result.settings.currtheme);
        document.getElementById("label-theme-" + result.settings.currtheme).className += " active";
        document.getElementById("theme-" + result.settings.currtheme).checked = true;

    });
}

function setTheme(id) {
    let xml = fs.readFileSync('client/xml/settings.xml');
    let parser = new xml2js.Parser();
    parser.parseString(xml, function(err,result) {
        if (document.getElementById(id).getAttribute("value")>0 && document.getElementById(id).getAttribute("value")<=10) {
            result.settings.currtheme = document.getElementById(id).getAttribute("value");
        }
        else{
            result.settings.currtheme="1";
        }
        let builder = new xml2js.Builder();
        xml = builder.buildObject(result);
        fs.writeFileSync('client/xml/settings.xml', xml);
    });
}

function getUserInfo() {
    let interfaces = os.networkInterfaces();
    let addresses = [];
    addresses.push(os.userInfo().username);
    for (let k in interfaces) {
        for (let k2 in interfaces[k]) {
            let address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    if(addresses[1]===undefined)
        addresses.push("Not connected to internet");
    return addresses;
}

function updateUser() {
    let addresses = getUserInfo();
    document.getElementById("ip").innerHTML=addresses[1]+":"+port;
    document.getElementById("user").innerHTML=addresses[0];

}

function updateUserMessage() {
    let addresses = getUserInfo();
    document.getElementById("localMsg").innerHTML="IP:&emsp;\""+addresses[1]+":"+port+"\"";
    let xml = fs.readFileSync('client/xml/settings.xml');
    let parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        document.getElementById("remoteMsg").innerHTML="ID:&emsp;\""+result.settings.id+"\"";
    });

}

function checkID() {
    try {
        let xml = fs.readFileSync('client/xml/settings.xml');
        let parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
            if(result.settings.id === "" || result.settings.id === undefined || result.settings.id==null) {
                result.settings.id = uniqid();
                let builder = new xml2js.Builder();
                xml = builder.buildObject(result);
                fs.writeFileSync('client/xml/settings.xml', xml);
            }

        });
    } catch (err) {
        fs.appendFileSync('client/xml/settings.xml',
            "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
            "<settings>\n" +
            "  <currtheme>1</currtheme>\n" +
            "  <id>"+uniqid()+"</id>\n" +
            "</settings>",
            function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
    }
}

function newProPic() {
    dialog.showOpenDialog({ filters: [{ name: 'image', extensions: ['jpg','jpeg','png'] }]},
        (fileName) => {
            // fileNames is an array that contains all the selected
            if(fileName === undefined)
            {
                return;
            }
            let content = fs.readFileSync(fileName.toString());
            fs.writeFileSync("client/img/user.jpg", content);
            fs.writeFileSync("public/img/user.jpg", content);
            document.getElementById("proPic").src="img/user.jpg?"+Math.random();
            if (document.getElementById('proPic2') !==null) {
                document.getElementById("proPic2").src="img/user.jpg?"+Math.random();
            }
        });
}

function delProPic() {
    fs.stat('client/img/user.jpg', function (err) {
        if (err) {
            return console.error(err);
        }

        fs.unlink('client/img/user.jpg',function(err){
            if(err) return ;
            fs.unlink('public/img/user.jpg',function(err){
                if(err) return ;
                document.getElementById("proPic").src="img/user.jpg?"+Math.random();
                if (document.getElementById('proPic2') !==null) {
                    document.getElementById("proPic2").src="img/user.jpg?"+Math.random();
                }
            });
        });
    });
}

checkID();
