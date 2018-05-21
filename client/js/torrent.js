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

process.on('message', (m) => {
    if(m==='updateMusic'){
        updateSharedFiles(localMusic,".mp3");
        process.send(
            {   type: 'updatedMusic',
                data: localMusic
            }
        );
    }
    if(m==='updateVideo'){
        updateSharedFiles(localVideo,".mp4");
        process.send(
            {   type: 'updatedVideo',
                data: localVideo
            }
        );
    }
});

function updateSharedFiles(obj,ext){
    obj.files=findVideos(ext);
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

updateSharedFiles(localMusic,".mp3");
updateSharedFiles(localVideo,".mp4");

/*

client.seed("/Users/Nicola/Downloads/Media/New Girl/4.mp4", function (torrent) {
    console.log('Client is seeding ' + torrent.infoHash);
    console.log('Client is seeding ' + torrent.path);
});
*/