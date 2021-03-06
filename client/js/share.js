$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

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
});

function addPathMessage() {
    let xml = fs.readFileSync('client/xml/paths.xml');
    let parser = new xml2js.Parser();
    let exist = "0";
    let subf = "0";
    let fatherf = "0";
    parser.parseString(xml, function (err, result) {
        if (fs.existsSync(document.getElementById("path").value) && fs.lstatSync(document.getElementById("path").value).isDirectory()) {
            for (let k in result.pathlist.path) {
                if (result.pathlist.path[k].folder === document.getElementById("path").value) {
                    exist = "1";
                    break;
                }
                else if(document.getElementById("path").value.toString().startsWith(result.pathlist.path[k].folder.toString())){
                    subf = result.pathlist.path[k].folder;
                    break;
                }
                else if(result.pathlist.path[k].folder.toString().startsWith(document.getElementById("path").value.toString())){
                    fatherf = "1";
                    break;
                }
            }
            if (exist !== "0") {
                swal({
                    title: 'Warning',
                    text: 'The selected folder is already shared.',
                    type: 'warning',
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-sm btn-light',
                    background: 'rgba(0, 0, 0, 0.96)'
                })
            }else if (subf !== "0") {
                swal({
                    title: 'Warning',
                    text: 'The selected folder is a sub-folder of the already shared folder: '+subf+'.',
                    type: 'warning',
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-sm btn-light',
                    background: 'rgba(0, 0, 0, 0.96)'
                })
            } else if (fatherf !== "0") {
                swal({
                    title: 'Warning',
                    text: 'The selected folder has already shared subfolders, the subfolders will be replaced with the selected folder, proceed?',
                    type: 'warning',
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-danger',
                    confirmButtonText: 'Yes, Replace it!',
                    cancelButtonText: 'Cancel',
                    cancelButtonClass: 'btn btn-light',
                    background: 'rgba(0, 0, 0, 0.96)'
                }).then(function () {
                    for (let k in result.pathlist.path) {
                        if(result.pathlist.path[k].folder.toString().startsWith(document.getElementById("path").value.toString())){
                            deletePath(result.pathlist.path[k].idPath.toString());
                        }
                    }
                    addPath();
                });
            }
            else {
                addPath();
                swal({
                    title: 'Great',
                    text: 'The folder was successfully added.',
                    type: 'success',
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-sm btn-light',
                    background: 'rgba(0, 0, 0, 0.96)'
                })
            }
        }
        else {
            swal({
                title: 'Ops',
                text: 'It seems that the inserted path does not exist in your system.',
                type: 'error',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-sm btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            })
        }
    });
}

function addPath(){
    let xml = fs.readFileSync('client/xml/paths.xml');
    let parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        let newPath;
        if (result.pathlist.length === 0) {
            newPath = {
                path: [{
                    idPath: uniqid('folder-'),
                    folder: document.getElementById("path").value
                }]
            };
            result.pathlist = newPath;
        } else {
            newPath = {
                idPath: uniqid('folder-'),
                folder: document.getElementById("path").value
            };
            result.pathlist.path.push(newPath);
        }
        let builder = new xml2js.Builder();
        xml = builder.buildObject(result);
        fs.writeFileSync('client/xml/paths.xml', xml);
        document.getElementById("path").value = "";
        updateFolderTable();
        ipcRenderer.send('updateData');
    });
}

function deletePathMessage(e) {
    let found;
    swal({
        title: 'Warning',
        text: 'You are sure you want to stop sharing the folder: ' + e.getAttribute("folder") + ' ?',
        type: 'warning',
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        confirmButtonText: 'Yes, Delete it!',
        cancelButtonText: 'Cancel',
        cancelButtonClass: 'btn btn-light',
        background: 'rgba(0, 0, 0, 0.96)'
    }).then(function () {
        found=deletePath(e.getAttribute("idPath"));
        if (found === "1") {
            swal({
                title: 'Success',
                text: 'The folder has been deleted.',
                type: 'success',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
        }
        else{
            swal({
                title: 'Warning',
                text: 'It seems that the selected folder was not present.',
                type: 'warning',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
        }
    });
}

function deletePath(idPath){
    let xml = fs.readFileSync('client/xml/paths.xml');
    let parser = new xml2js.Parser();
    let found = "0";
    parser.parseString(xml, function (err, result) {
        for (let j in result.pathlist.path) {
            if (result.pathlist.path[j].idPath.toString() === idPath.toString()) {
                found = "1";
                delete result.pathlist.path[j];
                let builder = new xml2js.Builder();
                xml = builder.buildObject(result);
                fs.writeFileSync('client/xml/paths.xml', xml);
                break;
            }
        }
    });
    updateFolderTable();
    ipcRenderer.send('updateData');
    return found;
}

function updateFolderTable() {
    let table = $('#pathTable').DataTable();
    let xml = fs.readFileSync('client/xml/paths.xml');
    let parser = new xml2js.Parser();
    table.clear().draw();
    parser.parseString(xml, function (err, result) {
        if (result.pathlist.length !== 0) {
            result.pathlist.path.forEach(function (element) {
                table.row.add([
                    element.folder.toString(),
                    "<i class='zmdi zmdi-delete zmdi-hc-lg' onclick='deletePathMessage(this)' idPath='" + element.idPath.toString() + "' folder='" + element.folder.toString() + "'></i>"]).draw();
            });
        }
    });
}