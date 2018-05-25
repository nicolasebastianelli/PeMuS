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
                user.name=xhr.responseText;
                let xhr2 = new XMLHttpRequest();
                xhr2.open('GET', "http://"+hostname+":"+port+"/getMusicList", true);
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
    if(folder!==undefined){
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
    let path = currFolder.split("/").filter(function (entry) {
        return /\S/.test(entry);
    });
    let folderPath = "";
    let nav = "<li class=\"breadcrumb-item\"><a href='#' onclick=updateFolderList('/')>Home</a></li>";
    for (let i in path) {
        folderPath += path[i] + "/";
        let clickFolder = JSON.stringify(folderPath).replace(/ /g, '&nbsp;');
        let userId=(function () {
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
        document.getElementById("searchBar").style.display="none";
            document.getElementById("folderList").innerHTML +=
                "<div class=\"col-xl-3 col-lg-4 col-sm-5 col-4\" onclick=updateFolderList(" + JSON.stringify(hostname).replace(/"/g, "&quot;") + ")>" +
                "<div class=\"contacts__item\">" +
                "<a href=\"#\" ><img src=\"img/user.jpg\" onerror=\"if (this.src !== 'img/Default-user.png') this.src = 'img/Default-user.png';\" class=\"folder__img\"></a>" +
                "<div class=\"contacts__info\">" +
                "<strong>" + user.name + "</strong>" +
                "<small>" + hostname +"</small></div></div></div>";
        }
    else {
        document.getElementById("searchBar").style.display="block";
                let element = "<div class=\"card\"><div class=\"card-body\"><table id=\"musicTable\" class=\"table table-hover mb-0\"><tbody>";
                for (let j in user.files) {
                    let encodeText = encodeURIComponent(user.files[j]);
                    let l = j;
                    l++;
                    element += "<tr><th scope=\"row\">" + l + "</th><td name=\""+encodeText+"\">" + user.files[j].split("/").pop().replace(/\.[^/.]+$/, "") + "</td></tr>"
                }
                element += "</tbody></table></div></div>";
                document.getElementById("musicList").innerHTML = element;
                let table = document.getElementById("musicTable");
                let rows = table.getElementsByTagName("tr");
                for (let i = 0; i < rows.length; i++) {
                    let currentRow = table.rows[i];
                    let createClickHandler = function(table, index) {
                        return function() {
                            let currentRow = table.rows[index];
                            let encodeText = currentRow.getElementsByTagName("td")[0].getAttribute("name");
                            let url ="http://"+hostname+":"+port+"/stream?source="+encodeText;
                            let xhr = new XMLHttpRequest();
                            xhr.open('GET', "http://" + hostname+ ":"+port+"/available?source=" + encodeText, false);
                            xhr.onload = function () {
                                if (xhr.readyState === 4) {
                                    if (xhr.status === 200) {
                                        if (xhr.responseText === "true") {
                                            document.getElementById("videoContent").innerHTML = "<h5 id=\"songName\">"+decodeURIComponent(encodeText).split("/").pop().replace(/\.[^/.]+$/, "")+"</h5><audio id=\"audioPlayer\" style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay controlsList=\"nodownload\" onloadstart=\"this.volume=0.5\" name=\"media\">" +
                                                "<source src=" + url + " type=\"audio/mp3\"></audio>";
                                            let nextIndex;
                                            let nextSong = function(table, index) {
                                                return function() {
                                                    let music = document.getElementById("audioPlayer");
                                                    if (index === table.rows.length - 1) {
                                                        nextIndex = 0;
                                                    }
                                                    else {
                                                        nextIndex = index + 1;
                                                    }
                                                    music.onended = nextSong(table, nextIndex);
                                                    music.pause();
                                                    let currentRow = table.rows[index];
                                                    let encodeText = currentRow.getElementsByTagName("td")[0].getAttribute("name");
                                                    document.getElementById("songName").innerText=decodeURIComponent(encodeText).split("/").pop().replace(/\.[^/.]+$/, "");
                                                    url = "http://" + hostname + ":"+port+"/stream?source=" + encodeText;
                                                    music.src = url;
                                                    music.load();
                                                    music.play();
                                                }
                                            };
                                            let music = document.getElementById("audioPlayer");
                                            if (index === table.rows.length-1){
                                                nextIndex =0;
                                            }
                                            else{
                                                nextIndex =index+1;
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

function searchFolder() {
    let element = "<div class=\"card\"><div class=\"card-body\"><table id=\"musicTable\" class=\"table table-hover mb-0\"><tbody>";
        for (let j in user.files) {
            let l = j;
            l++;
            let encodeText = encodeURIComponent(user.files[j]);
            if(document.getElementById("searchInput").value!==""&&document.getElementById("searchInput").value!==undefined&&document.getElementById("searchInput").value!=null) {
                if (user.files[j].split("/").pop().replace(/\.[^/.]+$/, "").toLowerCase().indexOf(document.getElementById("searchInput").value.toLowerCase()) !== -1) {
                    element += "<tr><th scope=\"row\">" + l + "</th><td name=\""+encodeText+"\">" + user.files[j].split("/").pop().replace(/\.[^/.]+$/, "") + "</td></tr>\n"
                }
            }
            else{
                element += "<tr><th scope=\"row\">" + l + "</th><td name=\""+encodeText+"\">" + user.files[j].split("/").pop().replace(/\.[^/.]+$/, "") + "</td></tr>\n"
            }
        }
    element+="</tbody></table></div></div>";
    document.getElementById("musicList").innerHTML=element;
    let table = document.getElementById("musicTable");
    let rows = table.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
        let currentRow = table.rows[i];
        let createClickHandler = function(table, index) {
            return function() {
                let currentRow = table.rows[index];
                let encodeText = currentRow.getElementsByTagName("td")[0].getAttribute("name");
                let url ="http://"+hostname+":"+port+"/stream?source="+encodeText;
                let xhr = new XMLHttpRequest();
                xhr.open('GET', "http://" + hostname+ ":"+port+"/available?source=" + encodeText, false);
                xhr.onload = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            if (xhr.responseText === "true") {
                                document.getElementById("videoContent").innerHTML = "<h5 id=\"songName\">"+decodeURIComponent(encodeText).split("/").pop().replace(/\.[^/.]+$/, "")+"</h5><audio id=\"audioPlayer\" style=\"display: block;width: 100%;margin: 0 auto; \" controls autoplay controlsList=\"nodownload\" onloadstart=\"this.volume=0.5\" name=\"media\">" +
                                    "<source src=" + url + " type=\"audio/mp3\"></audio>";
                                let nextIndex;
                                let nextSong = function(table, index) {
                                    return function() {
                                        let music = document.getElementById("audioPlayer");
                                        if (index === table.rows.length - 1) {
                                            nextIndex = 0;
                                        }
                                        else {
                                            nextIndex = index + 1;
                                        }
                                        music.onended = nextSong(table, nextIndex);
                                        music.pause();
                                        let currentRow = table.rows[index];
                                        let encodeText = currentRow.getElementsByTagName("td")[0].getAttribute("name");
                                        document.getElementById("songName").innerText=decodeURIComponent(encodeText).split("/").pop().replace(/\.[^/.]+$/, "");
                                        url = "http://" + hostname + ":"+port+"/stream?source=" + encodeText;
                                        music.src = url;
                                        music.load();
                                        music.play();
                                    }
                                };
                                let music = document.getElementById("audioPlayer");
                                if (index === table.rows.length-1){
                                    nextIndex =0;
                                }
                                else{
                                    nextIndex =index+1;
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