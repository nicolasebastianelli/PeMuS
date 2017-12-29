var fs = require('fs');
var xml2js = require('xml2js');
var os = require('os');
var path = require('path');
$.getScript("js/sharedFiles.js", function() {});

function updateSharedFiles(){
        var myUsr={
            ip: "localhost",
            name: os.userInfo().username,
            active: 1,
            videos: [ ]
        };
        myUsr.videos=findVideos();
        if (fileList.users.length != 0) {
            for (j in fileList.users) {
                if(fileList.users[j].ip=="localhost"){
                    delete fileList.users[j];
                    break;
                }

            }
        }
        fileList.users.push(myUsr);
        updateFolderList("/")
}

function findVideos() {
    var xml = fs.readFileSync('pages/xml/paths.xml');
    var parser = new xml2js.Parser();
    var res =[];
    parser.parseString(xml, function (err, result) {
        for (k in result.pathlist.path) {
            fromDir(result.pathlist.path[k].folder.toString(),res);
        }
    });
    return res;
}

function fromDir(startPath,res){
    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            fromDir(filename,res);
        }
        else if (filename.indexOf(".doc")>=0) {
            res.push(filename);
        }
    }
}

function updateFolderList(currFolder) {
    if(currFolder=="/"){
        document.getElementById("folderList").innerHTML="";
        for (k in fileList.users){
            document.getElementById("folderList").innerHTML+=
                "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\">"+
                "<div class=\"contacts__item\">"+
                "<a href=\"#\" ><img src=\"img/Default-user.png\"  class=\"folder__img\"></a>"+
                "<div class=\"contacts__info\">"+
                "<strong>"+fileList.users[k].name+"</strong>"+
                "<small>"+(function(){if(fileList.users[k].ip=="localhost"){return "Questo PC";} else{return fileList.users[k].ip;}}());+"</small></div></div></div>";
        }
    }
    else{

    }
}

/*
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

*/