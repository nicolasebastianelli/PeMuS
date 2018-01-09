var fs = require('fs');
var xml2js = require('xml2js');
var os = require('os');
var path = require('path');
var currFolder="/";
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
        updateFolderList();
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
        try {
            var stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                fromDir(filename, res);
            }
            else if (filename.indexOf(".txt") >= 0) {
                res.push(filename);
            }
        }
        catch (err){ console.log("Errore navigazione path: "+err);}
    }
}

function updateFolderList(folder) {
    if(folder!=undefined){
        currFolder=folder;
    }
    if(currFolder=="/"){
        document.getElementById("folderList").innerHTML="";
        document.getElementById("navBar").innerHTML=
            "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
        for (k in fileList.users){
            document.getElementById("folderList").innerHTML+=
                "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList("+JSON.stringify(fileList.users[k].ip).replace(/"/g,"&quot;")+")>"+
                "<div class=\"contacts__item\">"+
                "<a href=\"#\" ><img src=\"img/Default-user.png\"  class=\"folder__img\"></a>"+
                "<div class=\"contacts__info\">"+
                "<strong>"+fileList.users[k].name+"</strong>"+
                "<small>"+(function(){if(fileList.users[k].ip=="localhost"){return "Questo PC";} else{return fileList.users[k].ip;}}());+"</small></div></div></div>";
        }
    }
    else{
        document.getElementById("folderList").innerHTML="";
        var path = currFolder.split("/").filter(function(entry) { return /\S/.test(entry); });
        var folderPath="";
        var nav ="<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
        for (i in path) {
            folderPath+=path[i]+"/";
            nav+="<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList(" + JSON.stringify(folderPath).replace(/"/g, "&quot;") + ")>" + (function(){if(path[i]=="localhost"){return "Questo PC";} else{return path[i];}}()); + "</a></li>";
        }
        document.getElementById("navBar").innerHTML=nav;

        for (k in fileList.users){
            if(fileList.users[k].ip==path[0]) {
                var element="";
                var addedFolder = [];
                for (j in fileList.users[k].videos) {
                    var videoPath=fileList.users[k].videos[j].split("/").filter(function(entry) { return /\S/.test(entry); });
                    if( $.inArray(videoPath[path.length - 1], addedFolder) == -1 && fileList.users[k].videos[j].toString().startsWith(folderPath.replace(fileList.users[k].ip, ""))) {
                        if (videoPath[path.length] != undefined)
                            element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList(" + JSON.stringify(folderPath  + videoPath[path.length - 1]).replace(/"/g, "&quot;") + ")>" +
                                "<div class=\"contacts__item\">" +
                                "<a href=\"#\" ><img src=\"img/Folder-icon.png\"  class=\"folder__img\"></a>";
                        else {
                            element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\")>" +
                                "<div class=\"contacts__item\">" +
                                "<a href=\"#\" ><img src=\"img/Video-icon.png\"  class=\"folder__img\"></a>";
                        }
                        element += "<div class=\"contacts__info\">" +
                            "<strong>" + videoPath[path.length - 1] + "</strong></div></div></div>";
                        document.getElementById("folderList").innerHTML = element;
                        addedFolder.push(videoPath[path.length - 1]);
                    }
                }
            }
        }
    }
}

function searchFolder() {
    for (k in fileList.users) {
        var element = "";
        for (j in fileList.users[k].videos) {
            var file =fileList.users[k].videos[j].split("/");
            if(file[file.length-1].indexOf(document.getElementById("searchInput").value)!==-1){
                element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\")>" +
                    "<div class=\"contacts__item\">" +
                    "<a href=\"#\" ><img src=\"img/Video-icon.png\"  class=\"folder__img\"></a>"+
                    "<div class=\"contacts__info\">" +
                    "<strong>" + file[file.length-1] + "</strong>"+
                    "<small>"+fileList.users[k].ip+"</small></div></div></div>";
            }
        }
    }
    document.getElementById("folderList").innerHTML = element;
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