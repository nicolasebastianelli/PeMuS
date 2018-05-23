let currFolder="/";

$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

ipcRenderer.send('updateData');

ipcRenderer.on('updateData', function(event,arg) {
    if (videoList.users.length !== 0) {
        for (let j in videoList.users) {
            if(videoList.users[j].ip==="localhost"){
                delete videoList.users[j];
                break;
            }

        }
    }
    videoList.users.push(arg.video);
    updateFolderList();
});

function updateFolderList(folder) {
    if(folder!== undefined){
        currFolder=folder.replace(/\s/g, ' ');
    }
    document.getElementById("folderList").innerHTML = "";
    if(currFolder.endsWith(".mp4")){
        document.getElementById("videoContent").style.display="block";
    }
    else {
        document.getElementById("videoContent").innerHTML = "";
        let path = currFolder.split("/").filter(function (entry) {
            return /\S/.test(entry);
        });
        let folderPath = "";
        let nav = "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
        for (let i in path) {
            let user =(function () {
                if (path[i] === "localhost") {
                    return "This PC";
                } else {
                    return path[i];
                }
            }());
            folderPath += path[i] + "/";
            let clickFolder = JSON.stringify(folderPath).replace(/ /g, '&nbsp;');
            nav += "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList("+clickFolder+")>" + user +"</a></li>";
        }
        document.getElementById("navBar").innerHTML = nav;

        if (currFolder === "/") {
            for (let k in videoList.users) {
                let user = (function () {
                    if (videoList.users[k].ip === "localhost") {
                        return "This PC";
                    } else {
                        return videoList.users[k].ip;
                    }
                }());
                document.getElementById("folderList").innerHTML +=
                    "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList(" + JSON.stringify(videoList.users[k].ip).replace(/"/g, "&quot;") + ")>" +
                    "<div class=\"contacts__item\">" +
                    "<a href=\"#\" ><img src=\"img/user.jpg\" id=\"proPic2\" onerror=\"if (this.src !== 'img/Default-user.png') this.src = 'img/Default-user.png';\" class=\"folder__img\"></a>" +
                    "<div class=\"contacts__info\">" +
                    "<strong>" + videoList.users[k].name + "</strong>" +
                    "<small>" + user + "</small></div></div></div>";
            }
        }
        else {
            for (let k in videoList.users) {
                if (videoList.users[k].ip === path[0]) {
                    let element = "";
                    let addedFolder = [];
                    for (let j in videoList.users[k].files) {
                        let videoPath = videoList.users[k].files[j].name.split("/").filter(function (entry) {
                            return /\S/.test(entry);
                        });
                        if ($.inArray(videoPath[path.length - 1], addedFolder) === -1 && videoList.users[k].files[j].name.toString().startsWith(folderPath.replace(videoList.users[k].ip, ""))) {
                            if (videoPath[path.length] !== undefined) {
                                let clickFolder = JSON.stringify(folderPath + videoPath[path.length - 1]).replace(/ /g, '&nbsp;');
                                element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList("+clickFolder+")>" +
                                    "<div class=\"contacts__item\">" +
                                    "<a href=\"#\" ><img src=\"img/Folder-icon.png\"  class=\"folder__img\"></a>";
                            }
                            else {
                                let clickFolder = JSON.stringify(videoList.users[k].files[j].name).replace(/ /g, '&nbsp;');
                                let clickIP = JSON.stringify(videoList.users[k].ip).replace(/ /g, '&nbsp;');
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
    let element = "";
    for (let k in videoList.users) {
        for (let j in videoList.users[k].files) {
            let file =videoList.users[k].files[j].name.split("/");
            if(document.getElementById("searchInput").value!==""&&document.getElementById("searchInput").value!==undefined&&document.getElementById("searchInput").value!=null) {
                if (file[file.length - 1].toLowerCase().indexOf(document.getElementById("searchInput").value.toLowerCase()) !== -1) {
                    element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\">" +
                        "<div class=\"contacts__item\" onclick=videoPlayer(" + JSON.stringify(videoList.users[k].ip).replace(/"/g, "&quot;") + "," + JSON.stringify(videoList.users[k].files[j].name).replace(/"/g, "&quot;") + ")>" +
                        "<a href=\"#\" ><img src=\"img/Video-icon.png\"  class=\"folder__img\"></a>" +
                        "<div class=\"contacts__info\">" +
                        "<strong>" + file[file.length - 1] + "</strong>" +
                        "<small>" + videoList.users[k].ip + "</small></div></div></div>";
                }
            }
            else{
                element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\">" +
                    "<div class=\"contacts__item\" onclick=videoPlayer(" + JSON.stringify(videoList.users[k].ip).replace(/"/g, "&quot;") + "," + JSON.stringify(videoList.users[k].files[j].name).replace(/"/g, "&quot;") + ")>" +
                    "<a href=\"#\" ><img src=\"img/Video-icon.png\"  class=\"folder__img\"></a>" +
                    "<div class=\"contacts__info\">" +
                    "<strong>" + file[file.length - 1] + "</strong>" +
                    "<small>" + videoList.users[k].ip + "</small></div></div></div>";
            }
        }
    }
    document.getElementById("folderList").innerHTML = element;
}

function videoPlayer(ip,source) {
    if(ip!==undefined && source!==undefined){
        currFolder=ip+source.replace(/\s/g, ' ');
    }
    document.getElementById("videoContent").style.display="block";
    document.getElementById("folderList").innerHTML="";
    document.getElementById("videoContent").innerHTML="";
    let path = currFolder.split("/").filter(function(entry) { return /\S/.test(entry); });
    let title =path.pop();
    let folderPath="";
    let nav ="<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
    for (let i in path) {
        folderPath+=path[i]+"/";
        let clickFolder = JSON.stringify(folderPath);
        nav+="<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList(" + clickFolder + ")>" + (function(){if(path[i]==="localhost"){return "This PC";} else{return path[i];}}()); + "</a></li>";
    }
    let encodeText = encodeURIComponent(source);
    let url ="http://"+ip+":"+port+"/stream?source="+encodeText;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "http://"+ip+":"+port+"/available?source="+encodeText, false);
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (xhr.responseText==="true") {
                    document.getElementById("navBar").innerHTML=nav;
                    document.getElementById("videoContent").innerHTML="<h2>"+title+"</h2><br><video style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay controlsList=\"nodownload\" name=\"media\">"+
                        "<source src="+url+" type=\"video/mp4\"></video>";
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