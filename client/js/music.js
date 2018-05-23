let currFolder="/";

$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

ipcRenderer.send('updateData');

ipcRenderer.on('updateData', function(event,arg) {
    if (musicList.users.length !== 0) {
        for (let j in musicList.users) {
            if(musicList.users[j].ip==="localhost"){
                delete musicList.users[j];
                break;
            }
        }
    }
    musicList.users.push(arg.music);
    updateFolderList();
});

function updateFolderList(folder) {
    if(folder!=undefined){
        currFolder=folder.replace(/\s/g, ' ');
    }
    document.getElementById("folderList").innerHTML = "";
    document.getElementById("musicList").innerHTML = "";
    if(currFolder.toString() !== "/"){
        document.getElementById("videoContent").style.display="block";
    }
    else {
        document.getElementById("videoContent").innerHTML = "";
        document.getElementById("videoContent").style.display="none";
    }
        var path = currFolder.split("/").filter(function (entry) {
            return /\S/.test(entry);
        });
        var folderPath = "";
        var nav = "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
        for (i in path) {
            folderPath += path[i] + "/";
            var clickFolder = JSON.stringify(folderPath).replace(/ /g, '&nbsp;');
            nav += "<li class=\"breadcrumb-item\"><a href='#'>" + (function () {
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
            document.getElementById("searchBar").style.display="none";
            for (k in musicList.users) {
                document.getElementById("folderList").innerHTML +=
                    "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList(" + JSON.stringify(musicList.users[k].ip).replace(/"/g, "&quot;") + ")>" +
                    "<div class=\"contacts__item\">" +
                    "<a href=\"#\" ><img src=\"img/user.jpg\" id=\"proPic2\" onerror=\"if (this.src != 'img/Default-user.png') this.src = 'img/Default-user.png';\" class=\"folder__img\"></a>" +
                    "<div class=\"contacts__info\">" +
                    "<strong>" + musicList.users[k].name + "</strong>" +
                    "<small>" + (function () {
                        if (musicList.users[k].ip == "localhost") {
                            return "This PC";
                        } else {
                            return musicList.users[k].ip;
                        }
                    }());
                +"</small></div></div></div>";
            }
        }
        else {
            document.getElementById("searchBar").style.display="block";
            var element = "";
            for (k in musicList.users) {
                if (musicList.users[k].ip === path[0]) {
                    var element = "<div class=\"card\"><div class=\"card-body\"><table id=\"musicTable\" class=\"table table-hover mb-0\"><tbody>";
                    for (j in musicList.users[k].files) {
                        var encodeText = encodeURIComponent(musicList.users[k].files[j].name);
                        var l = j;
                        l++;
                        element += "<tr><th scope=\"row\">" + l + "</th><td name=\""+encodeText+"\">" + musicList.users[k].files[j].name.split("/").pop().replace(/\.[^/.]+$/, "") + "</td></tr>\n"
                    }
                    element += "</tbody></table></div></div>";
                    document.getElementById("musicList").innerHTML = element;
                    var table = document.getElementById("musicTable");
                    var rows = table.getElementsByTagName("tr");
                    for (i = 0; i < rows.length; i++) {
                        var currentRow = table.rows[i];
                        var createClickHandler = function(table, index) {
                            return function() {
                                var currentRow = table.rows[index];
                                encodeText = currentRow.getElementsByTagName("td")[0].getAttribute("name");
                                url ="http://"+musicList.users[k].ip+":"+port+"/stream?source="+encodeText;
                                xhr = new XMLHttpRequest();
                                xhr.open('GET', "http://" + musicList.users[k].ip + ":"+port+"/available?source=" + encodeText, false);
                                xhr.onload = function (e) {
                                    if (xhr.readyState === 4) {
                                        if (xhr.status === 200) {
                                            if (xhr.responseText === "true") {
                                                document.getElementById("videoContent").innerHTML = "<h5 id=\"songName\">"+decodeURIComponent(encodeText).split("/").pop().replace(/\.[^/.]+$/, "")+"</h5><audio id=\"audioPlayer\" style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay controlsList=\"nodownload\" onloadstart=\"this.volume=0.5\" name=\"media\">" +
                                                    "<source src=" + url + " type=\"audio/mp3\"></audio>";
                                                var nextSong = function(table, index) {
                                                    return function() {
                                                        var music = document.getElementById("audioPlayer");
                                                        if (index === table.rows.length - 1) {
                                                            var nextIndex = 0;
                                                        }
                                                        else {
                                                            var nextIndex = index + 1;
                                                        }
                                                        music.onended = nextSong(table, nextIndex);
                                                        music.pause();
                                                        var currentRow = table.rows[index];
                                                        var encodeText = currentRow.getElementsByTagName("td")[0].getAttribute("name");
                                                        document.getElementById("songName").innerText=decodeURIComponent(encodeText).split("/").pop().replace(/\.[^/.]+$/, "");
                                                        var url = "http://" + musicList.users[k].ip + ":"+port+"/stream?source=" + encodeText;
                                                        music.src = url;
                                                        music.load();
                                                        music.play();
                                                    }
                                                };
                                                var music = document.getElementById("audioPlayer");
                                                if (index === table.rows.length-1){
                                                    var nextIndex =0;
                                                }
                                                else{
                                                    var nextIndex =index+1;
                                                }
                                                music.onended = nextSong(table, nextIndex);
                                            }
                                            else {
                                                swal({
                                                    title: 'Warning',
                                                    text: 'The selected song seems to not be available at the moment.',
                                                    type: 'warning',
                                                    buttonsStyling: false,
                                                    confirmButtonClass: 'btn btn-sm btn-light',
                                                    background: 'rgba(0, 0, 0, 0.96)'
                                                }).then(function () {
                                                    updateSharedFiles();
                                                    updateFolderList("/");
                                                });
                                            }
                                        }
                                    }
                                };
                                xhr.send();
                            };
                        };
                        currentRow.onclick = createClickHandler(table,i);
                    }
                }
            }
        }
}

function searchFolder() {
    var element = "<div class=\"card\"><div class=\"card-body\"><table id=\"musicTable\" class=\"table table-hover mb-0\"><tbody>";
    for (k in musicList.users) {
        for (j in musicList.users[k].files) {
            var l = j;
            l++;
            var encodeText = encodeURIComponent(musicList.users[k].files[j].name);
            if(document.getElementById("searchInput").value!=""&&document.getElementById("searchInput").value!=undefined&&document.getElementById("searchInput").value!=null) {
                if (musicList.users[k].files[j].name.split("/").pop().replace(/\.[^/.]+$/, "").toLowerCase().indexOf(document.getElementById("searchInput").value.toLowerCase()) !== -1) {
                    element += "<tr><th scope=\"row\">" + l + "</th><td name=\""+encodeText+"\">" + musicList.users[k].files[j].name.split("/").pop().replace(/\.[^/.]+$/, "") + "</td></tr>\n"
                }
            }
            else{
                element += "<tr><th scope=\"row\">" + l + "</th><td name=\""+encodeText+"\">" + musicList.users[k].files[j].name.split("/").pop().replace(/\.[^/.]+$/, "") + "</td></tr>\n"
            }
        }
    }
    element+="</tbody></table></div></div>";
    document.getElementById("musicList").innerHTML=element;
    var table = document.getElementById("musicTable");
    var rows = table.getElementsByTagName("tr");
    for (i = 0; i < rows.length; i++) {
        var currentRow = table.rows[i];
        var createClickHandler = function(table, index) {
            return function() {
                var currentRow = table.rows[index];
                encodeText = currentRow.getElementsByTagName("td")[0].getAttribute("name");
                url ="http://"+musicList.users[k].ip+":"+port+"/stream?source="+encodeText;
                xhr = new XMLHttpRequest();
                xhr.open('GET', "http://" + musicList.users[k].ip + ":"+port+"/available?source=" + encodeText, false);
                xhr.onload = function (e) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            if (xhr.responseText === "true") {
                                document.getElementById("videoContent").innerHTML = "<h5 id=\"songName\">"+decodeURIComponent(encodeText).split("/").pop().replace(/\.[^/.]+$/, "")+"</h5><audio id=\"audioPlayer\" style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay controlsList=\"nodownload\" onloadstart=\"this.volume=0.5\" name=\"media\">" +
                                    "<source src=" + url + " type=\"audio/mp3\"></audio>";
                                var nextSong = function(table, index) {
                                    return function() {
                                        var music = document.getElementById("audioPlayer");
                                        if (index === table.rows.length - 1) {
                                            var nextIndex = 0;
                                        }
                                        else {
                                            var nextIndex = index + 1;
                                        }
                                        music.onended = nextSong(table, nextIndex);
                                        music.pause();
                                        var currentRow = table.rows[index];
                                        var encodeText = currentRow.getElementsByTagName("td")[0].getAttribute("name");
                                        document.getElementById("songName").innerText=decodeURIComponent(encodeText).split("/").pop().replace(/\.[^/.]+$/, "");
                                        var url = "http://" + musicList.users[k].ip + ":"+port+"/stream?source=" + encodeText;
                                        music.src = url;
                                        music.load();
                                        music.play();
                                    }
                                };
                                var music = document.getElementById("audioPlayer");
                                if (index === table.rows.length-1){
                                    var nextIndex =0;
                                }
                                else{
                                    var nextIndex =index+1;
                                }
                                music.onended = nextSong(table, nextIndex);
                            }
                            else {
                                swal({
                                    title: 'Warning',
                                    text: 'The selected song seems to not be available at the moment.',
                                    type: 'warning',
                                    buttonsStyling: false,
                                    confirmButtonClass: 'btn btn-sm btn-light',
                                    background: 'rgba(0, 0, 0, 0.96)'
                                }).then(function () {
                                    updateSharedFiles();
                                    updateFolderList("/");
                                });
                            }
                        }
                    }
                };
                xhr.send();
            };
        };
        currentRow.onclick = createClickHandler(table,i);
    }
}