var fs = require('fs');
var xml2js = require('xml2js');
var os = require('os');
var uniqid = require('uniqid');

$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

var table = $('#pathTable').DataTable();

function addPath() {
    var xml = fs.readFileSync('pages/xml/paths.xml');
    var parser = new xml2js.Parser();
    var trovato = "0";
    parser.parseString(xml, function (err, result) {
        if (fs.existsSync(document.getElementById("path").value) && fs.lstatSync(document.getElementById("path").value).isDirectory()) {
            for (k in result.pathlist.path) {
                if (result.pathlist.path[k].folder == document.getElementById("path").value) {
                    trovato = "1";
                }
            }
            if (trovato == "1") {
                updateFolderTable();
                swal({
                    title: 'Attenzione',
                    text: 'La cartella selezionata è già presente.',
                    type: 'warning',
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-sm btn-light',
                    background: 'rgba(0, 0, 0, 0.96)'
                })
            }
            else {
                var newPath;
                if (result.pathlist.length == 0) {
                    newPath = {
                        path: [{
                            idPath: uniqid('folder-'),
                            ip: "localhost",
                            username: os.userInfo().username,
                            folder: document.getElementById("path").value
                        }]
                    };
                    result.pathlist = newPath;
                } else {
                    newPath = {
                        idPath: uniqid('folder-'),
                        ip: "localhost",
                        username: os.userInfo().username,
                        folder: document.getElementById("path").value
                    };
                    result.pathlist.path.push(newPath);
                }
                var builder = new xml2js.Builder();
                xml = builder.buildObject(result);
                fs.writeFile('pages/xml/paths.xml', xml,(error)=>{});
                document.getElementById("path").value = "";
                updateFolderTable();
                swal({
                    title: 'Alla Grande',
                    text: 'La cartella è stata aggiunta con successo.',
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
                text: 'Sembra che il path inserito non esista nel sistema.',
                type: 'error',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-sm btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            })
        }
    });
}

function updateFolderTable() {
    var xml = fs.readFileSync('pages/xml/paths.xml');
    var parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        if (result.pathlist.length != 0) {
            result.pathlist.path.forEach(function (element) {
                table.row.add([element.ip.toString(),
                    element.username.toString(),
                    element.folder.toString(),
                    "<i class='zmdi zmdi-delete zmdi-hc-lg' onclick='deletePath(this)' idPath='" + element.idPath.toString() + "' folder='" + element.folder.toString() + "'></i>"]).draw();

            });
        }
    });
}

function deletePath(e) {
    swal({
        title: 'Attenzione',
        text: 'Sei sicuro di voler smettere di condividere la cartella: ' + e.getAttribute("folder") + ' ?',
        type: 'warning',
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        confirmButtonText: 'Si, Elimina!',
        cancelButtonText: 'Annulla',
        cancelButtonClass: 'btn btn-light',
        background: 'rgba(0, 0, 0, 0.96)'
    }).then(function () {
        var xml = fs.readFileSync('pages/xml/paths.xml');
        var parser = new xml2js.Parser();
        var trovato = "0";
        if (e.getAttribute("folder") == null || e.getAttribute("folder") == "") {
            swal({
                title: 'Attenzione',
                text: 'Sembra che la cartella selezionata fosse già non presente',
                type: 'warning',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
        }
        else {
            parser.parseString(xml, function (err, result) {
                for (k in result.pathlist.path) {
                    if (result.pathlist.path[k].idPath == e.getAttribute("folder")) {
                        trovato = "1";
                        delete result.pathlist.path[k];
                    }
                }
                if (trovato == "1") {
                    var builder = new xml2js.Builder();
                    xml = builder.buildObject(result);
                    fs.writeFile('pages/xml/paths.xml', xml,(error)=>{});
                    swal({
                        title: 'Successo',
                        text: 'La cartella è stata eliminata',
                        type: 'success',
                        buttonsStyling: false,
                        confirmButtonClass: 'btn btn-light',
                        background: 'rgba(0, 0, 0, 0.96)'
                    });
                }
            });
        }
    });
}