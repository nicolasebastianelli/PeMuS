var fs = require('fs');
var xml2js = require('xml2js');
var os = require('os');
var path = require('path');
var currFolder="/";
var fileList = {
    users: []
};

$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

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
    var xml = fs.readFileSync('client/xml/paths.xml');
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
            else if (filename.indexOf(".mp3") >= 0) {
                res.push(filename);
            }
        }
        catch (err){ console.log("Errore navigazione path: "+err);}
    }
}


function updateFolderList(folder) {
    if(folder!=undefined){
        currFolder=folder.replace(/\s/g, ' ');
    }
    document.getElementById("folderList").innerHTML = "";
    document.getElementById("musicList").innerHTML = "";
    if(currFolder.endsWith(".mp3")){
        document.getElementById("videoContent").style.display="block";
    }
    else {
        document.getElementById("videoContent").innerHTML = "";
        var path = currFolder.split("/").filter(function (entry) {
            return /\S/.test(entry);
        });
        var folderPath = "";
        var nav = "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
        for (i in path) {
            folderPath += path[i] + "/";
            var clickFolder = JSON.stringify(folderPath).replace(/ /g, '&nbsp;');
            nav += "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList(" + clickFolder + ")>" + (function () {
                if (path[i] == "localhost") {
                    return "This PC";
                } else {
                    return path[i];
                }
            }());
            +"</a></li>";
        }
        document.getElementById("navBar").innerHTML = nav;

        if (currFolder == "/") {
            for (k in fileList.users) {
                document.getElementById("folderList").innerHTML +=
                    "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList(" + JSON.stringify(fileList.users[k].ip).replace(/"/g, "&quot;") + ")>" +
                    "<div class=\"contacts__item\">" +
                    "<a href=\"#\" ><img src=\"img/user.jpg\" onerror=\"if (this.src != 'img/Default-user.png') this.src = 'img/Default-user.png';\" class=\"folder__img\"></a>" +
                    "<div class=\"contacts__info\">" +
                    "<strong>" + fileList.users[k].name + "</strong>" +
                    "<small>" + (function () {
                        if (fileList.users[k].ip == "localhost") {
                            return "This PC";
                        } else {
                            return fileList.users[k].ip;
                        }
                    }());
                +"</small></div></div></div>";
            }
        }
        else {
            var element = "";
            for (k in fileList.users) {
                if (fileList.users[k].ip === path[0]) {
                    var encodeText = encodeURIComponent(fileList.users[k].videos[0]);
                    var url = "http://" + fileList.users[k].ip + ":8080/stream?source=" + encodeText;
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', "http://" + fileList.users[k].ip + ":8080/available?source=" + encodeText, false);
                    xhr.onload = function (e) {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                if (xhr.responseText === "true") {
                                    document.getElementById("navBar").innerHTML = nav;
                                    document.getElementById("videoContent").innerHTML = "<audio style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay controlsList=\"nodownload\" name=\"media\">" +
                                        "<source src=" + url + " type=\"audio/mp3\"></audio>";
                                }
                            }
                        }
                    };
                    xhr.send();
                    var element = "<div class=\"card\"><div class=\"card-body\"><table class=\"table table-hover mb-0\"><tbody>";
                    for (j in fileList.users[k].videos) {
                        element += "<tr><th scope=\"row\">" + j + "</th><td>" + fileList.users[k].videos[j].split("/").pop().replace(/\.[^/.]+$/, "") + "</td></tr>\n"


                    }
                    element += "</tbody></table></div></div>";
                    document.getElementById("musicList").innerHTML = element;
                }
            }
        }
    }
}

function searchFolder() {
    var element = "<div class=\"card\"><div class=\"card-body\"><table class=\"table table-hover mb-0\"><tbody>";
    for (k in fileList.users) {
        for (j in fileList.users[k].videos) {
            if(document.getElementById("searchInput").value!=""&&document.getElementById("searchInput").value!=undefined&&document.getElementById("searchInput").value!=null) {
                if (fileList.users[k].videos[j].split("/").pop().replace(/\.[^/.]+$/, "").toLowerCase().indexOf(document.getElementById("searchInput").value.toLowerCase()) !== -1) {
                        element+= "<tr><th scope=\"row\">"+j+"</th><td>"+fileList.users[k].videos[j].split("/").pop().replace(/\.[^/.]+$/, "")+"</td></tr>\n"
                }
            }
            else{
                element+= "<tr><th scope=\"row\">"+j+"</th><td>"+fileList.users[k].videos[j].split("/").pop().replace(/\.[^/.]+$/, "")+"</td></tr>\n"
            }
        }
    }
    element+="</tbody></table></div></div>";
    document.getElementById("musicList").innerHTML=element;
}

function videoPlayer(ip,source) {
    if (ip != undefined && source != undefined) {
        currFolder = ip + source.replace(/\s/g, ' ');
    }
    document.getElementById("videoContent").style.display = "block";
    document.getElementById("folderList").innerHTML = "";
    document.getElementById("videoContent").innerHTML = "";
    var path = currFolder.split("/").filter(function (entry) {
        return /\S/.test(entry);
    });
    var title = path.pop();
    var folderPath = "";
    var nav = "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
    for (i in path) {
        folderPath += path[i] + "/";
        clickFolder = JSON.stringify(folderPath);
        nav += "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList(" + clickFolder + ")>" + (function () {
            if (path[i] == "localhost") {
                return "This PC";
            } else {
                return path[i];
            }
        }());
        +"</a></li>";
    }

    var url = "http://" + ip + ":8080/stream?source=" + encodeText;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://" + ip + ":8080/available?source=" + encodeText, false);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (xhr.responseText === "true") {
                    document.getElementById("navBar").innerHTML = nav;
                    document.getElementById("videoContent").innerHTML = "<h2>" + title + "</h2><br><audio style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay controlsList=\"nodownload\" name=\"media\">" +
                        "<source src=" + url + " type=\"audio/mp3\"></audio>";
                }
                else {
                    swal({
                        title: 'Warning',
                        text: 'The selected video seems to not be available at the moment.',
                        type: 'warning',
                        buttonsStyling: false,
                        confirmButtonClass: 'btn btn-sm btn-light',
                        background: 'rgba(0, 0, 0, 0.96)'
                    }).then(function () {
                        updateSharedFiles();
                        updateFolderList("/");
                    });
                }
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.send();
}