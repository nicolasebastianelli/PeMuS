const Peer = require('peerjs');
const WebTorrent = require('webtorrent');
const ipcRenderer = require('electron').ipcRenderer;
const portServer =3000;
const hostServer ='localhost';
let ID;
let client = new WebTorrent();
let localName =os.userInfo().username;

let videoList = {
    users: []
};

let musicList = {
    users: []
};

let imgMagnetUri;

$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

let xml = fs.readFileSync('client/xml/settings.xml');
let parser = new xml2js.Parser();
parser.parseString(xml, function (err, result) {
    ID=result.settings.id;
});

ipcRenderer.send('getData');

ipcRenderer.on('getData', function(event,arg) {
    if (videoList.users.length !== 0) {
        for (let j in videoList.users) {
            if(videoList.users[j].ip==="localhost"){
                delete videoList.users[j];
                break;
            }
        }
    }
    if (musicList.users.length !== 0) {
        for (let j in musicList.users) {
            if(musicList.users[j].ip==="localhost"){
                delete musicList.users[j];
                break;
            }
        }
    }
    videoList.users.push(arg.video);
    musicList.users.push(arg.music);
    imgMagnetUri = arg.imgUri;
});

let peer = new Peer(ID, {
    host: hostServer,
    port: portServer,
    path: '/peerjs'
});

peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);
});

peer.on('error', function(err){
    console.log(err.type);
    if(err.type==="unavailable-id"){
        swal({
            title: 'Ops',
            text: 'It seems that the your id is already used in the server, a new id will be assigned.',
            type: 'error',
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-sm btn-light',
            background: 'rgba(0, 0, 0, 0.96)'
        });
        xml = fs.readFileSync('client/xml/settings.xml');
        parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
            result.settings.id = uniqid();
            let builder = new xml2js.Builder();
            xml = builder.buildObject(result);
            fs.writeFileSync('client/xml/settings.xml', xml);
            ID = result.settings.id;
            try{
                document.getElementById("remoteMsg").innerHTML="ID:&emsp;\""+ID+"\"";
            }
            catch(err){}
        });
    }
    if(err.type==="disconnected"||err.type==="server-error"){
        swal({
            title: 'Ops',
            text: 'It seems that the dispatcher server is not available, contact the developer.',
            type: 'error',
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-sm btn-light',
            background: 'rgba(0, 0, 0, 0.96)'
        })
    }
    if(err.type==="peer-unavailable"){
        if(document.title==="PeMuS - Index") {
            swal({
                title: 'Ops',
                text: 'It seems that the user you are trying to contact is offline, ask him to launch the application.',
                type: 'error',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-sm btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            })
        }
    }
});

peer.on('connection', function(conn) {

    if(conn.metadata.type==='conn-req') {
        client.add(conn.metadata.imgMagnetUri,{ path: 'client/img' } ,function (torrent) {
            torrent.on('done', function () {
                fs.writeFileSync("client/img", torrent);
            });
        });
        xml = fs.readFileSync('client/xml/pending.xml');
        parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
            let exist = "0";
            for (k in result.servers.server) {
                if (result.servers.server[k].id.toString() === conn.metadata.id.toString()) {
                    exist = "1";
                    break;
                }
            }
            if (exist !== "0") {
                updateNotification();
                return;
            }
            let newServer;
            if (result.servers.length === 0) {
                newServer = {
                    server: [{
                        id: conn.metadata.id,
                        name: conn.metadata.name
                    }]
                };
                result.servers = newServer;
            } else {
                newServer = {
                    id: conn.metadata.id,
                    name: conn.metadata.name
                };
                result.servers.server.push(newServer);
            }
            let builder = new xml2js.Builder();
            xml = builder.buildObject(result);
            fs.writeFileSync('client/xml/pending.xml', xml);
            updateNotification();
        });
    }

    if(conn.metadata.type==='conn-confirm') {
        let xml = fs.readFileSync('client/xml/servers.xml');
        let parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
            let exist = "0";
            for (k in result.servers.server) {
                if (result.servers.server[k].id.toString() === conn.metadata.id.toString()) {
                    exist = "1";
                    break;
                }
            }
            if (exist !== "0") {
                updateNotification();
                return;
            }
            let newServer;
            if (result.servers.length === 0) {
                newServer = {
                    server: [{
                        id: conn.metadata.id,
                        name: conn.metadata.name
                    }]
                };
                result.servers = newServer;
            } else {
                newServer = {
                    id: conn.metadata.id,
                    name: conn.metadata.name
                };
                result.servers.server.push(newServer);
            }
            let builder = new xml2js.Builder();
            xml = builder.buildObject(result);
            fs.writeFileSync('client/xml/servers.xml', xml);
            swal({
                title: 'Success',
                text: 'The server: '+conn.metadata.id+' - '+conn.metadata.name+' has accepted your connection, you are now connected!',
                type: 'success',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-sm btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
            try {
                updateServerTable();
            }
            catch(err){}
        });
    }

    if(conn.metadata.type==='fileList-req') {
        let localVideo;
        let localMusic;
        let temp;
        for (let k in videoList.users) {
            if(videoList.users[k].ip==='localhost'){
                temp=videoList.users[k].files;
                break;
            }
        }
        for (let k in temp) {
            temp[k].name="/"+temp[k].name.split('/').pop();
        }
        localVideo=temp;
        for (let k in musicList.users) {
            if(musicList.users[k].ip==='localhost'){
                temp=musicList.users[k].files;
                break;
            }
        }
        for (let k in temp) {
            temp[k].name="/"+temp[k].name.split('/').pop();
        }
        localMusic=temp;
        let connection = peer.connect(conn.metadata.id, {
            metadata: {
                name: localName,
                id: ID,
                type: 'fileList-answ',
                video: localVideo,
                music: localMusic
            }
        });
        connection.on('error', function(err) {
            console.log(err);
        });
        connection.on('close', function() {
            console.log("Connection with "+conn.metadata.id+" done");
        });

        connection.on('open', function() {
            // Send messages
            connection.send('msg');
            connection.close();
        });
    }
});

function sendRequest(){
    let remoteID=document.getElementById('remoteID').value;
    let exist = "0";
    if(remoteID.toString()===ID.toString()){
        swal({
            title: 'Warning',
            text: 'You cannot connect to yourself.',
            type: 'warning',
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-sm btn-light',
            background: 'rgba(0, 0, 0, 0.96)'
        });
        return;
    }
    xml = fs.readFileSync('client/xml/servers.xml');
    parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        for (k in result.servers.server) {
            if (result.servers.server[k].id === remoteID) {
                exist = "1";
                break;
            }
        }
        if (exist !== "0") {
            swal({
                title: 'Warning',
                text: 'This server is already in your connection list.',
                type: 'warning',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-sm btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
            return;
        }

        let connection = peer.connect(remoteID,{
            metadata: {
                name: localName,
                id: ID,
                imgMagnetUri: imgMagnetUri,
                type: 'conn-req'
            }
        });

        connection.on('error', function(err) {
            swal({
                title: 'Ops',
                text: 'It seems that an unexpected error occur, prease retry.',
                type: 'error',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-sm btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
            console.log(err);
        });

        connection.on('close', function() {
            swal({
                title: 'Success',
                text: 'The request to '+remoteID+' has been sent.',
                type: 'success',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
        });

        connection.on('open', function() {
            console.log('Connected to ', remoteID);

            // Send messages
            connection.send('msg');
            connection.close();
        });
    });

    document.getElementById("remoteID").value = "";
}

function updateNotification(){
    let xml = fs.readFileSync('client/xml/pending.xml');
    document.getElementById("requestList").innerHTML ="";
    let parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        if (result.servers.length !== 0) {
            document.getElementById("notificationTwink").className = "top-nav__notify";
            for (k in result.servers.server) {
                document.getElementById("requestList").innerHTML += "<a href=\"#\" class=\"listview__item\">" +
                    "<img src=\"img/"+result.servers.server[k].id+".jpg\" onerror=\"if (this.src !== 'img/Default-user.png') this.src = 'img/Default-user.png';\" class=\"listview__img\" alt=\"\">" +
                    "<div class=\"listview__content\">" +
                    "<div class=\"listview__heading\">"+result.servers.server[k].name+" - "+result.servers.server[k].id+"</div>" +
                    "<button type=\"button\" class=\"btn btn-success btn--icon-text\" onclick='confirmConn(this)' serverId='"+result.servers.server[k].id+"' serverName='"+result.servers.server[k].name+"' ><i class=\"zmdi zmdi-check\"></i> Confirm</button>" +
                    "<button type=\"button\" class=\"btn btn-danger btn--icon-text\" onclick='denyConn(this)'  serverId='"+result.servers.server[k].id+"'><i class=\"zmdi zmdi-close\"></i> Deny</button></div></a>";
            }
        }
        else{
            document.getElementById("notificationTwink").className = "";
        }
    });
}

function confirmConn(e){

    let remoteID =e.getAttribute("serverId");

    let connection = peer.connect(remoteID,{
        metadata: {
            name: localName,
            id: ID,
            type: 'conn-confirm'
        }
    });

    connection.on('error', function(err) {
        swal({
            title: 'Ops',
            text: 'It seems that an unexpected error occur, prease retry.',
            type: 'error',
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-sm btn-light',
            background: 'rgba(0, 0, 0, 0.96)'
        });
        console.log(err);
    });

    connection.on('close', function() {
        let xml = fs.readFileSync('client/xml/servers.xml');
        let parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
            let exist = "0";
            for (let k in result.servers.server) {
                if (result.servers.server[k].id.toString() === remoteID) {
                    exist = "1";
                    break;
                }
            }
            if (exist !== "0") {
                updateNotification();
                return;
            }
            let newServer;
            if (result.servers.length === 0) {
                newServer = {
                    server: [{
                        id: e.getAttribute("serverId"),
                        name: e.getAttribute("serverName")
                    }]
                };
                result.servers = newServer;
            } else {
                newServer = {
                    id: e.getAttribute("serverId"),
                    name: e.getAttribute("serverName")
                };
                result.servers.server.push(newServer);
            }
            let builder = new xml2js.Builder();
            xml = builder.buildObject(result);
            fs.writeFileSync('client/xml/servers.xml', xml);
        });
        xml = fs.readFileSync('client/xml/pending.xml');
        parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
            for (j in result.servers.server) {
                if (result.servers.server[j].id === e.getAttribute("serverId")) {
                    delete result.servers.server[j];
                    var builder = new xml2js.Builder();
                    xml = builder.buildObject(result);
                    fs.writeFileSync('client/xml/pending.xml', xml);
                    break;
                }
            }
        });
        swal({
            title: 'Success',
            text: 'The validation to '+e.getAttribute("serverId")+' - '+e.getAttribute("serverName")+' has been sent, you are now connected.',
            type: 'success',
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-light',
            background: 'rgba(0, 0, 0, 0.96)'
        });
        updateNotification();
        try {
            updateServerTable();
        }
        catch(err){}
    });

    connection.on('open', function() {
        console.log('Connected to ', e.getAttribute("serverId"));

        // Send messages
        connection.send('msg');
        connection.close();
    });
}

function denyConn(e){
    let xml = fs.readFileSync('client/xml/pending.xml');
    let parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        for (j in result.servers.server) {
            if (result.servers.server[j].id === e.getAttribute("serverId")) {
                delete result.servers.server[j];
                var builder = new xml2js.Builder();
                xml = builder.buildObject(result);
                fs.writeFileSync('client/xml/pending.xml', xml);
                break;
            }
        }
    });
    updateNotification();
}

function updateCode(){
    document.getElementById("code").innerHTML=ID;
}

function updateServerTable() {
    let table = $('#serverTable').DataTable();
    let xml = fs.readFileSync('client/xml/servers.xml');
    let parser = new xml2js.Parser();
    table.clear().draw();
    parser.parseString(xml, function (err, result) {
        if (result.servers.length !== 0) {
            result.servers.server.forEach(function (element) {
                table.row.add([
                    element.id.toString(),
                    element.name.toString(),
                    "<i class='zmdi zmdi-delete zmdi-hc-lg' onclick='deleteServerMessage(this)' serverID='" + element.id.toString() + "' serverName='" + element.name.toString() + "'></i>"]).draw();
            });
        }
    });
}

function deleteServerMessage(e) {
    let found;
    swal({
        title: 'Warning',
        text: 'You are sure you want to disconnect from the server: ' + e.getAttribute("serverID") + ' - '+e.getAttribute("serverName")+' ?',
        type: 'warning',
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        confirmButtonText: 'Yes, Disconnect!',
        cancelButtonText: 'Cancel',
        cancelButtonClass: 'btn btn-light',
        background: 'rgba(0, 0, 0, 0.96)'
    }).then(function () {
        found=deleteServer(e.getAttribute("serverID"));
        if (found === "1") {
            swal({
                title: 'Success',
                text: 'The server has been deleted.',
                type: 'success',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
        }
        else{
            swal({
                title: 'Warning',
                text: 'It seems that the selected server was already deleted.',
                type: 'warning',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
        }
    });
}

function deleteServer(serverID){
    let xml = fs.readFileSync('client/xml/servers.xml');
    let parser = new xml2js.Parser();
    let found = "0";
    parser.parseString(xml, function (err, result) {
        for (let j in result.servers.server) {
            if (result.servers.server[j].id === serverID) {
                found = "1";
                delete result.servers.server[j];
                let builder = new xml2js.Builder();
                xml = builder.buildObject(result);
                fs.writeFileSync('client/xml/servers.xml', xml);
                break;
            }
        }
    });
    updateServerTable();
    return found;
}

updateCode();
updateNotification();