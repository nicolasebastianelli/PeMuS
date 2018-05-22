const WebTorrent = require('webtorrent-hybrid');
const os = require('os');
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

let client = new WebTorrent();

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
                        music: localMusic
                }
            }
        );
    }
});

function updateSharedFiles(obj,ext){
    obj.files=findVideos(ext);
    refreshSeed();
}

function findVideos(ext) {
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
                res.push(filename);
            }
        }
        catch (err){ console.log("Error path navigation: "+err);}
    }
}

function refreshSeed(){
    let found = "0" ;

    for (let j in seeding.video) {
        for (let k in localVideo.files) {
            if (seeding.video[j]===localVideo.files[k]){
                found="1";
            }
        }
        if(found==="0"){
            console.log("remove video seed "+seeding.video[j]);
            delete seeding.video[j];
        }
        found = "0" ;
    }

    for (let k in localVideo.files) {
        for (let j in seeding.video) {
            if (seeding.video[j]===localVideo.files[k]){
                found="1";
            }
        }
        if(found==="0"){
            seeding.video.push(localVideo.files[k]);
            console.log("added video seed "+localVideo.files[k]);
        }
        found = "0" ;
    }



    for (let j in seeding.music) {
        for (let k in localMusic.files) {
            if (seeding.music[j]===localMusic.files[k]){
                found="1";
            }
        }
        if(found==="0"){
            console.log("remove music seed "+seeding.music[j]);
            delete seeding.music[j];
        }
        found = "0" ;
    }

    for (let k in localMusic.files) {
        for (let j in seeding.music) {
            if (seeding.music[j]===localMusic.files[k]){
                found="1";
            }
        }
        if(found==="0"){
            seeding.music.push(localMusic.files[k]);
            console.log("added music seed "+localMusic.files[k]);
        }
        found = "0" ;
    }

}

function initialSeeding(){
    for (let k in localVideo.files) {
        seeding.video.push(localVideo.files[k]);
        console.log("initial add video seed "+seeding.video[k]);
    }
    for (let k in localMusic.files) {
        seeding.music.push(localMusic.files[k]);
        console.log("initial add music seed "+seeding.music[k]);
    }
}

updateSharedFiles(localMusic,".mp3");
updateSharedFiles(localVideo,".mp4");
initialSeeding();

/*
client.seed("/Users/Nicola/Downloads/Media/prova/Voldemort.mp4", function (torrent) {
    console.log('Client is seeding ' + torrent.magnetURI);
    console.log('Client is seeding ' + torrent.path);
});
*/