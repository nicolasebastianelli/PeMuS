const WebTorrent = require('webtorrent-hybrid');
const os = require('os');
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
EventEmitter.defaultMaxListeners = 0;

let client = new WebTorrent();

let imgMagnetUri;

let localVideo={
    ip: "localhost",
    name: os.userInfo().username,
    files: [ ]
};
let localMusic = {
    ip: "localhost",
    name: os.userInfo().username,
    files: [ ]
};

let seeding = {
    video: [],
    music: []
};

process.on('message', (m) => {
    if(m==='updateData'){
        updateSharedFiles(localVideo,".mp4");
        updateSharedFiles(localMusic,".mp3");
        process.send(
            {   type: 'updateData',
                data: { video: localVideo,
                    music: localMusic
                }
            }
        );
    }
    if(m==='getData'){
        process.send(
            {   type: 'getData',
                data: { video: localVideo,
                    music: localMusic,
                    imgUri:imgMagnetUri
                }
            }
        );
    }
});

function updateSharedFiles(obj,ext){
    obj.files=findFiles(ext);
    refreshSeed();
}

function findFiles(ext) {
    let xml = fs.readFileSync('client/xml/paths.xml');
    let parser = new xml2js.Parser();
    let res =[];
    parser.parseString(xml, function (err, result) {
        for (let k in result.pathlist.path) {
            fromDir(result.pathlist.path[k].folder.toString(),res,ext);
        }
    });
    return res;
}

function fromDir(startPath,res,ext){
    let files=fs.readdirSync(startPath);
    for(let i=0;i<files.length;i++){
        let filename=path.join(startPath,files[i]);
        try {
            let stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                fromDir(filename, res,ext);
            }
            else if (filename.indexOf(ext) >= 0) {
                res.push({
                    name:filename,
                    seed:""
                });
            }
        }
        catch (err){ console.log("Error path navigation: "+err);}
    }
}

function refreshSeed(){
    let found = "0" ;

    for (let j in seeding.video) {
        for (let k in localVideo.files) {
            if (seeding.video[j].name===localVideo.files[k].name){
                found="1";
                localVideo.files[k].seed=seeding.video[j].seed;
            }
        }
        if(found==="0"){
            client.remove(seeding.video[j].seed, function () {
                console.log("remove music seed "+seeding.video[j].name);
                delete seeding.video[j];
            });
        }
        found = "0" ;
    }

    for (let k in localVideo.files) {
        for (let j in seeding.video) {
            if (seeding.video[j].name===localVideo.files[k].name){
                found="1";
            }
        }
        if(found==="0"){
            client.seed(localVideo.files[k].name, function (torrent) {
                localVideo.files[k].seed=torrent.magnetURI;
                seeding.video.push(localVideo.files[k]);
                console.log("added video seed "+localVideo.files[k].name);
            });
        }
        found = "0" ;
    }



    for (let j in seeding.music) {
        for (let k in localMusic.files) {
            if (seeding.music[j].name===localMusic.files[k].name){
                found="1";
                localMusic.files[k].seed=seeding.music[j].seed;
            }
        }
        if(found==="0"){
            client.remove(seeding.music[j].seed, function () {
                console.log("remove music seed "+seeding.music[j].name);
                delete seeding.music[j];
            });
        }
        found = "0" ;
    }

    for (let k in localMusic.files) {
        for (let j in seeding.music) {
            if (seeding.music[j].name===localMusic.files[k].name){
                found="1";
            }
        }
        if(found==="0"){
            client.seed(localMusic.files[k].name, function (torrent) {
                localMusic.files[k].seed=torrent.magnetURI;
                seeding.music.push(localMusic.files[k]);
                console.log("added music seed "+localMusic.files[k].name);
            });
        }
        found = "0" ;
    }

}

function initialSeeding(){
    for (let k in localVideo.files) {
        client.seed(localVideo.files[k].name, function (torrent) {
            localVideo.files[k].seed=torrent.magnetURI;
            seeding.video.push(localVideo.files[k]);
            console.log("initial add video seed "+localVideo.files[k].name);
        });

    }
    for (let k in localMusic.files) {
        client.seed(localMusic.files[k].name, function (torrent) {
            localMusic.files[k].seed=torrent.magnetURI;
            seeding.music.push(localMusic.files[k]);
            console.log("initial add music seed "+localMusic.files[k].name);
        });
    }
}

localMusic.files=findFiles(".mp3");
localVideo.files=findFiles(".mp4");
initialSeeding();


client.seed("client/img/user.jpg", function (torrent) {
    imgMagnetUri =torrent.magnetURI;
    console.log('Client is seeding ' + imgMagnetUri);
});
