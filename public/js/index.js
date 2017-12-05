$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

var table = $('#pathTable').DataTable();

function addPath() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://"+ip+":8080/addPath?path="+document.getElementById("path").value, true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4) {
            if (xmlhttp.status == 200)
            {
                var resp = xmlhttp.responseText;
                if (resp == 0) {
                    swal({
                        title: 'Ops',
                        text: 'Sembra che il path inserito non esista nel sistema.',
                        type: 'error',
                        buttonsStyling: false,
                        confirmButtonClass: 'btn btn-sm btn-light',
                        background: 'rgba(0, 0, 0, 0.96)'
                    })
                } else if(resp == 1){
                    document.getElementById("path").value="";
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
                else if(resp == 2){
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
            }
            else{
                swal({
                     title: 'Ops',
                    text: 'Sembra che ci sia un errore inaspettato.',
                    type: 'error',
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-sm btn-light',
                    background: 'rgba(0, 0, 0, 0.96)'
                 })
            }
        }
    }
    xmlhttp.send();
}

function updateFolderTable() {
    var xmlhttp = new XMLHttpRequest();
    table.clear().draw();
    xmlhttp.open("GET","http://"+ip+":8080/getFolderList", true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var resp=JSON.parse(xmlhttp.responseText);
            resp.forEach(function (element) {
                table.row.add( [element.ip.toString(),
                    element.username.toString(),
                    element.folder.toString(),
                    "<i class='zmdi zmdi-delete zmdi-hc-lg' onclick='deletePath(this)' idPath='"+element.idPath.toString()+"' folder='"+element.folder.toString()+"'></i>"]).draw();
            });
        }
    }
    xmlhttp.send();
}

function deletePath(e) {
    swal({
        title: 'Attenzione',
        text: 'Sei sicuro di voler smettere di condividere la cartella: '+e.getAttribute("folder")+' ?',
        type: 'warning',
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-danger',
        confirmButtonText: 'Si, Elimina!',
        cancelButtonText: 'Annulla',
        cancelButtonClass: 'btn btn-light',
        background: 'rgba(0, 0, 0, 0.96)'
    }).then(function(){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET","http://"+ip+":8080/deletePath?idPath="+e.getAttribute("idPath"), true);
        xmlhttp.onreadystatechange=function(){
            if (xmlhttp.readyState==4) {
                if (xmlhttp.status == 200) {
                    var resp = JSON.parse(xmlhttp.responseText);
                    if(resp == 1) {
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
                    updateFolderTable();
                }
                else {
                    swal({
                        title: 'Ops',
                        text: 'Sembra che ci sia un errore inaspettato.',
                        type: 'error',
                        buttonsStyling: false,
                        confirmButtonClass: 'btn btn-sm btn-light',
                        background: 'rgba(0, 0, 0, 0.96)'
                    })
                }
            }
        }
        xmlhttp.send();
    });

}