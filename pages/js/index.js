var fs = require('fs');
var xml2js = require('xml2js');
var os = require('os');
var uniqid = require('uniqid');

$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

var table = $('#pathTable').DataTable();

function addPathMessage() {
    var xml = fs.readFileSync('pages/xml/paths.xml');
    var parser = new xml2js.Parser();
    var exist = "0";
    var subf = "0";
    var fatherf = "0";
    parser.parseString(xml, function (err, result) {
        if (fs.existsSync(document.getElementById("path").value) && fs.lstatSync(document.getElementById("path").value).isDirectory()) {
            for (k in result.pathlist.path) {
                if (result.pathlist.path[k].folder == document.getElementById("path").value) {
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
                    title: 'Attenzione',
                    text: 'La cartella selezionata è già condivisa.',
                    type: 'warning',
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-sm btn-light',
                    background: 'rgba(0, 0, 0, 0.96)'
                })
            }else if (subf !== "0") {
                swal({
                    title: 'Attenzione',
                    text: 'La cartella selezionata è una sottocartella della cartella '+subf+' già condivisa.',
                    type: 'warning',
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-sm btn-light',
                    background: 'rgba(0, 0, 0, 0.96)'
                })
            } else if (fatherf !== "0") {
                swal({
                    title: 'Attenzione',
                    text: 'La cartella selezionata contiente sottocartelle già condivise, le sottocartelle verranno sostituite con la cartella selezionata, procedere?',
                    type: 'warning',
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-danger',
                    confirmButtonText: 'Si, sostituisci!',
                    cancelButtonText: 'Annulla',
                    cancelButtonClass: 'btn btn-light',
                    background: 'rgba(0, 0, 0, 0.96)'
                }).then(function () {
                    for (k in result.pathlist.path) {
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

function addPath(){
    var xml = fs.readFileSync('pages/xml/paths.xml');
    var parser = new xml2js.Parser();
    parser.parseString(xml, function (err, result) {
        var newPath;
        if (result.pathlist.length == 0) {
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
        var builder = new xml2js.Builder();
        xml = builder.buildObject(result);
        fs.writeFileSync('pages/xml/paths.xml', xml);
        document.getElementById("path").value = "";
        updateFolderTable();
    });
}

function deletePathMessage(e) {
    var trovato;
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
        trovato=deletePath(e.getAttribute("idPath"))
        if (trovato === "1") {
            swal({
                title: 'Successo',
                text: 'La cartella è stata eliminata',
                type: 'success',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
        }
        else{
            swal({
                title: 'Attenzione',
                text: 'Sembra che la cartella selezionata fosse già non presente',
                type: 'warning',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-light',
                background: 'rgba(0, 0, 0, 0.96)'
            });
        }
    });
}

function deletePath(idPath){
    var xml = fs.readFileSync('pages/xml/paths.xml');
    var parser = new xml2js.Parser();
    var trovato = "0";
    parser.parseString(xml, function (err, result) {
        for (j in result.pathlist.path) {
            if (result.pathlist.path[j].idPath == idPath) {
                trovato = "1";
                delete result.pathlist.path[j];
                var builder = new xml2js.Builder();
                xml = builder.buildObject(result);
                fs.writeFileSync('pages/xml/paths.xml', xml);
                break;
            }
        }
    });
    updateFolderTable();
    return trovato;
}

function updateFolderTable() {
    var xml = fs.readFileSync('pages/xml/paths.xml');
    var parser = new xml2js.Parser();
    table.clear().draw();
    parser.parseString(xml, function (err, result) {
        if (result.pathlist.length != 0) {
            result.pathlist.path.forEach(function (element) {
                table.row.add([
                    element.folder.toString(),
                    "<i class='zmdi zmdi-delete zmdi-hc-lg' onclick='deletePathMessage(this)' idPath='" + element.idPath.toString() + "' folder='" + element.folder.toString() + "'></i>"]).draw();
            });
        }
    });
}