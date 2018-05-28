
let currFolder="/";
let user= {
    name: "",
    files: [ ]
};
$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

function updateSharedFiles(){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "http://"+hostname+":"+port+"/getUser", true);
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                user.name = xhr.responseText;
                let xhr2 = new XMLHttpRequest();
                xhr2.open('GET', "http://"+hostname+":"+port+"/getVideoList", true);
                xhr2.onload = function () {
                    if (xhr2.readyState === 4) {
                        if (xhr2.status === 200) {
                            user.files=JSON.parse(xhr2.responseText);
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
    document.getElementById("videoCard").style.visibility= "hidden";
    if(folder!==undefined){
        currFolder=folder.replace(/\s/g, ' ');
    }
    document.getElementById("folderList").innerHTML = "";
    if(currFolder.endsWith(".mp4")){
        document.getElementById("videoCard").style.visibility= "visible";
    }
    else {
        document.getElementById("videoContent").innerHTML = "";
        let path = currFolder.split("/").filter(function (entry) {
            return /\S/.test(entry);
        });
        let folderPath = "";
        let nav = "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
        for (let i in path) {
            folderPath += path[i] + "/";
            let clickFolder = JSON.stringify(folderPath).replace(/ /g, '&nbsp;');
            let userId = (function () {
                if (path[i] === "localhost") {
                    return "This PC";
                } else {
                    return path[i];
                }
            }());
            nav += "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList("+clickFolder+")>" + userId +"</a></li>";
        }
        document.getElementById("navBar").innerHTML = nav;

        if (currFolder === "/") {
            document.getElementById("folderList").innerHTML +=
                "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList(" + JSON.stringify(hostname).replace(/"/g, "&quot;") + ")>" +
                "<div class=\"contacts__item\">" +
                "<a href=\"#\" ><img src=\"img/user.jpg\" onerror=\"if (this.src !== 'img/Default-user.png') this.src = 'img/Default-user.png';\"  class=\"folder__img\"></a>" +
                "<div class=\"contacts__info\">" +
                "<strong>" + user.name + "</strong>" +
                "<small>" + hostname +"</small></div></div></div>";
        }
        else {
            let element = "";
            let addedFolder = [];
            for (let j in user.files) {
                let videoPath = user.files[j].split("/").filter(function (entry) {
                    return /\S/.test(entry);
                });
                if ($.inArray(videoPath[path.length - 1], addedFolder) === -1 && user.files[j].toString().startsWith(folderPath.replace(hostname, ""))) {
                    if (videoPath[path.length] !== undefined) {
                        let clickFolder = JSON.stringify(folderPath + videoPath[path.length - 1]).replace(/ /g, '&nbsp;');
                        element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList("+clickFolder+")>" +
                            "<div class=\"contacts__item\">" +
                            "<a href=\"#\" ><img src=\"img/Folder-icon.png\"  class=\"folder__img\"></a>";
                    }
                    else {
                        let clickFolder = JSON.stringify(user.files[j]).replace(/ /g, '&nbsp;');
                        let clickIP = JSON.stringify(hostname).replace(/ /g, '&nbsp;');
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

function searchFolder() {
    document.getElementById("videoCard").style.visibility= "hidden";
    let element = "";
    for (let j in user.files) {
        let file =user.files[j].split("/");
        if(document.getElementById("searchInput").value!==""&&document.getElementById("searchInput").value!==undefined&&document.getElementById("searchInput").value!=null) {
            if (file[file.length - 1].toLowerCase().indexOf(document.getElementById("searchInput").value.toLowerCase()) !== -1) {
                element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\">" +
                    "<div class=\"contacts__item\" onclick=videoPlayer(" + JSON.stringify(hostname).replace(/"/g, "&quot;").replace(/ /g, '&nbsp;') + "," + JSON.stringify(user.files[j]).replace(/"/g, "&quot;").replace(/ /g, '&nbsp;') + ")>" +
                    "<a href=\"#\" ><img src=\"img/Video-icon.png\"  class=\"folder__img\"></a>" +
                    "<div class=\"contacts__info\">" +
                    "<strong>" + file[file.length - 1] + "</strong>" +
                    "<small>" + hostname+ "</small></div></div></div>";
            }
        }
    }
    document.getElementById("folderList").innerHTML = element;
}

function videoPlayer(ip,source) {
    if(ip!==undefined&&source!==undefined){
        currFolder=ip+source.replace(/\s/g, ' ');
    }
    document.getElementById("videoCard").style.visibility= "visible";
    document.getElementById("folderList").innerHTML="";
    document.getElementById("videoContent").innerHTML="";
    let path = currFolder.split("/").filter(function(entry) { return /\S/.test(entry); });
    let title =path.pop();
    let folderPath="";
    let nav ="<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
    for (let i in path) {
        folderPath+=path[i]+"/";
        let clickFolder = JSON.stringify(folderPath).replace(/ /g, '&nbsp;');
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
                    document.getElementById("videoCard").style.visibility= "visible";
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