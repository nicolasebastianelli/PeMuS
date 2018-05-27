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
    if (musicList.users.length !== 0) {
        for (let j in musicList.users) {
            if(musicList.users[j].ip==="localhost"){
                delete musicList.users[j];
                break;
            }
        }
    }
    videoList.users.push(arg.video);
    musicList.users.push(arg.music);
    updateFolderList();
});

peer.on('connection', function(conn) {
    if(conn.metadata.type==='fileList-answ') {
        let newUsr={
            ip: conn.metadata.id,
            name: conn.metadata.name,
            files: conn.metadata.video
        };
        if (videoList.users.length !== 0) {
            for (let j in videoList.users) {
                if(videoList.users[j].ip===conn.metadata.id){
                    delete videoList.users[j];
                    break;
                }

            }
        }
        videoList.users.push(newUsr);
        updateFolderList();
    }
});

xml = fs.readFileSync('client/xml/servers.xml');
parser = new xml2js.Parser();
parser.parseString(xml, function (err, result) {
    for (let k in result.servers.server) {
        try {
            let connection = peer.connect(result.servers.server[k].id, {
                metadata: {
                    name: localName,
                    id: ID,
                    type: 'fileList-req',
                }
            });
            connection.on('error', function (err) {
                console.log(err);
            });
            connection.on('close', function () {
                console.log("Connection with " + result.servers.server[k].id + " done");
            });

            connection.on('open', function () {
                console.log('Connected to ', result.servers.server[k].id);

                // Send messages
                connection.send('msg');
                connection.close();
            });
        }
        catch(err){}
    }
});

function updateFolderList(folder) {
    document.getElementById("videoCard").style.visibility= "hidden";
    document.getElementById("videoContent").innerHTML = "";
    if(folder!== undefined){
        currFolder=folder.toString().replace(/\s/g, ' ');
    }
    document.getElementById("folderList").innerHTML = "";
    if(currFolder.endsWith(".mp4")){
        document.getElementById("videoCard").style.visibility= "visible";
    }
    else {
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
                if (videoList.users[k].ip.toString() === path[0].toString()) {
                    let element = "";
                    let addedFolder = [];
                    for (let j in videoList.users[k].files) {
                        let videoPath = videoList.users[k].files[j].name.toString().split("/").filter(function (entry) {
                            return /\S/.test(entry);
                        });
                        if ($.inArray(videoPath[path.length - 1], addedFolder) === -1 && videoList.users[k].files[j].name.toString().startsWith(folderPath.replace(videoList.users[k].ip.toString(), ""))) {
                            if (videoPath[path.length] !== undefined) {
                                let clickFolder = JSON.stringify(folderPath + videoPath[path.length - 1]).replace(/ /g, '&nbsp;');
                                element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList("+clickFolder+")>" +
                                    "<div class=\"contacts__item\">" +
                                    "<a href=\"#\" ><img src=\"img/Folder-icon.png\"  class=\"folder__img\"></a>";
                            }
                            else {
                                let clickFolder = JSON.stringify(videoList.users[k].files[j].name).replace(/ /g, '&nbsp;');
                                let clickIP = JSON.stringify(videoList.users[k].ip).replace(/ /g, '&nbsp;');
                                let megnetUri = JSON.stringify(videoList.users[k].files[j].seed).replace(/ /g, '&nbsp;');
                                element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=videoPlayer(" +clickIP+ "," +clickFolder + ","+megnetUri+")>" +
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
    document.getElementById("videoCard").style.visibility= "hidden";
    let element = "";
    for (let k in videoList.users) {
        for (let j in videoList.users[k].files) {
            let file =videoList.users[k].files[j].name.toString().split("/");
            let clickFolder = JSON.stringify(videoList.users[k].files[j].name).replace(/ /g, '&nbsp;');
            let clickIP = JSON.stringify(videoList.users[k].ip).replace(/ /g, '&nbsp;');
            let megnetUri = JSON.stringify(videoList.users[k].files[j].seed).replace(/ /g, '&nbsp;');
            if(document.getElementById("searchInput").value!==""&&document.getElementById("searchInput").value!==undefined&&document.getElementById("searchInput").value!=null) {
                if (file[file.length - 1].toLowerCase().indexOf(document.getElementById("searchInput").value.toLowerCase()) !== -1) {
                    element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\">" +
                        "<div class=\"contacts__item\" onclick=videoPlayer(" +clickIP+ "," +clickFolder + ","+megnetUri+")>" +
                        "<a href=\"#\" ><img src=\"img/Video-icon.png\"  class=\"folder__img\"></a>" +
                        "<div class=\"contacts__info\">" +
                        "<strong>" + file[file.length - 1] + "</strong>" +
                        "<small>" + videoList.users[k].ip + "</small></div></div></div>";
                }
            }
            else{
                element += "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\">" +
                    "<div class=\"contacts__item\" onclick=videoPlayer(" +clickIP+ "," +clickFolder + ","+megnetUri+")>" +
                    "<a href=\"#\" ><img src=\"img/Video-icon.png\"  class=\"folder__img\"></a>" +
                    "<div class=\"contacts__info\">" +
                    "<strong>" + file[file.length - 1] + "</strong>" +
                    "<small>" + videoList.users[k].ip + "</small></div></div></div>";
            }
        }
    }
    document.getElementById("folderList").innerHTML = element;
}

function videoPlayer(id,source,magnetUri) {
    currFolder = id + source.replace(/\s/g, ' ');
    document.getElementById("videoCard").style.visibility= "visible";
    document.getElementById("folderList").innerHTML = "";
    document.getElementById("videoContent").innerHTML = "";
    let videoPath=currFolder;
    let path = currFolder.split("/").filter(function (entry) {
        return /\S/.test(entry);
    });
    let title = path.pop();
    let folderPath = "";
    let nav = "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
    for (let i in path) {
        folderPath += path[i] + "/";
        let clickFolder = JSON.stringify(folderPath.replace(/ /g, '&nbsp;'));
        let userName = (function () {
            if (path[i] === "localhost") {
                return "This PC";
            } else {
                return path[i];
            }
        }());
        nav += "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList(" + clickFolder + ")>" + userName +"</a></li>";
    }
    if (id === "localhost") {
        let encodeText = encodeURIComponent(source);
        let url = "http://" + id + ":" + port + "/stream?source=" + encodeText;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', "http://" + id + ":" + port + "/available?source=" + encodeText, false);
        xhr.onload = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (xhr.responseText === "true") {
                        document.getElementById("navBar").innerHTML = nav;
                        document.getElementById("videoCard").style.visibility= "visible";
                        document.getElementById("videoContent").innerHTML = "<h2>" + title + "</h2><br><video style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay controlsList=\"nodownload\" name=\"media\">" +
                            "<source src=" + url + " type=\"video/mp4\"></video>";
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
                            ipcRenderer.send('updateData');
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
    else{
        //remote host
        document.getElementById("navBar").innerHTML = nav;
        document.getElementById("videoCard").style.visibility= "visible";
        document.getElementById("videoContent").innerHTML = "<h2>" + title + "</h1><br><img  src=\"img/loading.gif\">";

        console.log(magnetUri);
        let torrent = client.get(magnetUri);
        if (torrent === null) {
            client.add(magnetUri, function (torrent) {
                console.log('Adding Torrent', torrent.infoHash);
                loadTorrent(title,torrent,videoPath);
            });
        }
        else{
            console.log('Torrent already added', torrent.infoHash);
            loadTorrent(title,torrent,videoPath);
        }
    }
}

function loadTorrent(title,torrent, videoPath) {
    if(currFolder ===videoPath) {
        document.getElementById("videoContent").innerHTML = "<h2>" + title + "</h1><br><video id=\"myVideo\" style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay controlsList=\"nodownload\" name=\"media\">"
            + "<source src=\"\" type=\"video/mp4\"></video>";
        torrent.files[0].getBlobURL(function (err, url) {
            if (err) return util.error(err);

            let video = document.getElementById("myVideo");
            video.src = url;
            video.load();
            video.onloadeddata = function () {
                video.play();
            };
        });
    }
}