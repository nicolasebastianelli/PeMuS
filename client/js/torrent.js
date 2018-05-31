const WebTorrent = require('webtorrent-hybrid');
const os = require('os');
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
EventEmitter.defaultMaxListeners = 0;

let client = new WebTorrent();

client.on('error', function () {});

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
        localVideo.files=findFiles(".mp4");
        localMusic.files=findFiles(".mp3");
        refreshSeed();
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
    try {
        let found = "0";
        for (let j in seeding.video) {
            for (let k in localVideo.files) {
                if (seeding.video[j].name === localVideo.files[k].name) {
                    found = "1";
                    localVideo.files[k].seed = seeding.video[j].seed;
                }
            }
            if (found === "0") {
                client.remove(seeding.video[j].seed.toString(), function () {
                    if(seeding.video[j]!==undefined) {
                        console.log("remove video seed " + seeding.video[j].name);
                        delete seeding.video[j];
                    }else{
                        reInitialize();
                    }
                });
            }
            found = "0";
        }

        for (let k in localVideo.files) {
            for (let j in seeding.video) {
                if (seeding.video[j].name === localVideo.files[k].name) {
                    found = "1";
                }
            }
            if (found === "0") {
                client.seed(localVideo.files[k].name, function (torrent) {
                    if(localVideo.files[k]!==undefined) {
                        localVideo.files[k].seed = torrent.magnetURI;
                        seeding.video.push(localVideo.files[k]);
                        console.log("added video seed " + localVideo.files[k].name);
                    }else{
                        reInitialize();
                    }
                });
            }
            found = "0";
        }


        for (let j in seeding.music) {
            for (let k in localMusic.files) {
                if (seeding.music[j].name === localMusic.files[k].name) {
                    found = "1";
                    localMusic.files[k].seed = seeding.music[j].seed;
                }
            }
            if (found === "0") {
                client.remove(seeding.music[j].seed, function () {
                    if(seeding.music[j]!==undefined) {
                        console.log("remove music seed " + seeding.music[j].name);
                        delete seeding.music[j];
                    }else{
                        reInitialize();
                    }
                });
            }
            found = "0";
        }

        for (let k in localMusic.files) {
            for (let j in seeding.music) {
                if (seeding.music[j].name === localMusic.files[k].name) {
                    found = "1";
                }
            }
            if (found === "0") {
                client.seed(localMusic.files[k].name, function (torrent) {
                    if(localMusic.files[k]!==undefined) {
                        localMusic.files[k].seed = torrent.magnetURI;
                        seeding.music.push(localMusic.files[k]);
                        console.log("added music seed " + localMusic.files[k].name);
                    }else{
                        reInitialize();
                    }
                });
            }
            found = "0";
        }
    }catch(err){console.log(err);}
}

function reInitialize(){
    localVideo={
        ip: "localhost",
        name: os.userInfo().username,
        files: [ ]
    };
    localMusic = {
        ip: "localhost",
        name: os.userInfo().username,
        files: [ ]
    };
    seeding = {
        video: [],
        music: []
    };
    client.destroy(function () {
        console.log("destroying client");
        localMusic.files=findFiles(".mp3");
        localVideo.files=findFiles(".mp4");
        client = new WebTorrent();
        initialSeeding();
    })
}

function initialSeeding(){
    try {
        for (let k in localVideo.files) {
            client.seed(localVideo.files[k].name, function (torrent) {
                if(localVideo.files[k]!==undefined) {
                    localVideo.files[k].seed = torrent.magnetURI;
                    seeding.video.push(localVideo.files[k]);
                    console.log("initial add video seed " + localVideo.files[k].name);
                }
                else{
                    reInitialize();
                }
            });
        }
        for (let k in localMusic.files) {
            client.seed(localMusic.files[k].name, function (torrent) {
                if(localMusic.files[k]!==undefined) {
                    localMusic.files[k].seed = torrent.magnetURI;
                    seeding.music.push(localMusic.files[k]);
                    console.log("initial add music seed " + localMusic.files[k].name);
                }
                else{
                    reInitialize();
                }
            });
        }
    }catch(err){console.log(err);}
}

localMusic.files=findFiles(".mp3");
localVideo.files=findFiles(".mp4");
initialSeeding();



client.seed("client/img/user.jpg", function (torrent) {
    imgMagnetUri = torrent.magnetURI;
    console.log('Client is seeding ' + imgMagnetUri);
});
