
var currFolder="/";
var fileList = {
    users: []
};

$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

function updateSharedFiles(){
    fileList = {
        users: []
    };
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "http://"+window.location.hostname.toString()+":8080/getUser", true);
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var myUsr={
                        ip: window.location.hostname,
                        name: xhr.responseText,
                        active: 1,
                        videos: [ ]
                    };
                    var xhr2 = new XMLHttpRequest();
                    xhr2.open('GET', "http://"+window.location.hostname.toString()+":8080/getVideoList", true);
                    xhr2.onload = function (e) {
                        if (xhr2.readyState === 4) {
                            if (xhr2.status === 200) {
                                myUsr.videos=JSON.parse(xhr2.responseText);
                                fileList.users.push(myUsr);
                                updateFolderList();
                            } else {
                                console.error(xhr2.statusText);
                            }
                        }
                    };
                    xhr2.send();
                } else {
                    console.error(xhr.statusText);
                }
            }
        };
        xhr.send();

}

function updateFolderList(folder) {
    if(folder!=undefined){
        currFolder=folder.replace(/\s/g, ' ');
    }
    document.getElementById("folderList").innerHTML = "";
    if(currFolder.endsWith(".mp4")){
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
            nav += "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList("+clickFolder+")>" + (function () {
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
                    "<a href=\"#\" ><img src=\"img/Default-user.png\"  class=\"folder__img\"></a>" +
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
            for (k in fileList.users) {
                if (fileList.users[k].ip == path[0]) {
                    var element = "";
                    var addedFolder = [];
                    for (j in fileList.users[k].videos) {
                        var videoPath = fileList.users[k].videos[j].split("/").filter(function (entry) {
                            return /\S/.test(entry);
                        });
                        if ($.inArray(videoPath[path.length - 1], addedFolder) == -1 && fileList.users[k].videos[j].toString().startsWith(folderPath.replace(fileList.users[k].ip, ""))) {
                            if (videoPath[path.length] != undefined) {
                                clickFolder = JSON.stringify(folderPath + videoPath[path.length - 1]).replace(/ /g, '&nbsp;');
                                element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList("+clickFolder+")>" +
                                    "<div class=\"contacts__item\">" +
                                    "<a href=\"#\" ><img src=\"img/Folder-icon.png\"  class=\"folder__img\"></a>";
                            }
                            else {
                                clickFolder = JSON.stringify(fileList.users[k].videos[j]).replace(/ /g, '&nbsp;');
                                clickIP = JSON.stringify(fileList.users[k].ip).replace(/ /g, '&nbsp;');
                                element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=videoPlayer(" +clickIP+ "," +clickFolder + ")>" +
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
}

function searchFolder() {
    document.getElementById("videoContent").style.display="none";
    for (k in fileList.users) {
        var element = "";
        for (j in fileList.users[k].videos) {
            var file =fileList.users[k].videos[j].split("/");
            if(document.getElementById("searchInput").value!=""&&document.getElementById("searchInput").value!=undefined&&document.getElementById("searchInput").value!=null) {
                if (file[file.length - 1].toLowerCase().indexOf(document.getElementById("searchInput").value.toLowerCase()) !== -1) {
                    element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\")>" +
                        "<div class=\"contacts__item\" onclick=videoPlayer(" + JSON.stringify(fileList.users[k].ip).replace(/"/g, "&quot;") + "," + JSON.stringify(fileList.users[k].videos[j]).replace(/"/g, "&quot;") + ")>" +
                        "<a href=\"#\" ><img src=\"img/Video-icon.png\"  class=\"folder__img\"></a>" +
                        "<div class=\"contacts__info\">" +
                        "<strong>" + file[file.length - 1] + "</strong>" +
                        "<small>" + fileList.users[k].ip + "</small></div></div></div>";
                }
            }
        }
    }
    document.getElementById("folderList").innerHTML = element;
}

function videoPlayer(ip,source) {
    if(ip!=undefined&&source!=undefined){
        currFolder=ip+source.replace(/\s/g, ' ');
    }
    document.getElementById("videoContent").style.display="block";
    document.getElementById("folderList").innerHTML="";
    document.getElementById("videoContent").innerHTML="";
    var path = currFolder.split("/").filter(function(entry) { return /\S/.test(entry); });
    var title =path.pop();
    var folderPath="";
    var nav ="<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
    for (i in path) {
        folderPath+=path[i]+"/";
        clickFolder = JSON.stringify(folderPath);
        nav+="<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList(" + clickFolder + ")>" + (function(){if(path[i]=="localhost"){return "This PC";} else{return path[i];}}()); + "</a></li>";
    }
    var encodeText = encodeURIComponent(source);
    var url ="http://"+ip+":8080/stream?source="+encodeText;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://"+ip+":8080/available?source="+encodeText, false);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (xhr.responseText==="true") {
                    document.getElementById("navBar").innerHTML=nav;
                    document.getElementById("videoContent").innerHTML="<h2>"+title+"</h2><br><video style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay name=\"media\">"+
                        "<source src="+url+" type=\"video/mp4\"></video>";
                }
                else {
                    swal({
                        title: 'Attention',
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