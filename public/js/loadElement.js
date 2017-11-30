$.getScript("vendors/bower_components/sweetalert2/dist/sweetalert2.min.js", function() {});

var ip ="192.168.1.72";
var table = $('#pathTable').DataTable();

function updateTheme() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://"+ip+":8080/getTheme", true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var resp = xmlhttp.responseText;
            document.getElementsByTagName("body")[0].setAttribute("data-sa-theme",resp);
            document.getElementById("label-theme-"+resp).className += " active"
            document.getElementById("theme-"+resp).checked = true;
        }
    }
    xmlhttp.send();

}

function setTheme(id) {
   var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://"+ip+":8080/setTheme?theme="+document.getElementById(id).getAttribute("value"), true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var resp = xmlhttp.responseText;
        }
    }
    xmlhttp.send();
}

function updateUser() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://"+ip+":8080/getUserInfo", true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var resp=JSON.parse(xmlhttp.responseText);
            document.getElementById("user").innerHTML=resp[0];
            document.getElementById("ip").innerHTML=resp[1];
        }
    }
    xmlhttp.send();
}

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
                        text: 'Sembra che il path inserito non esista nel tuo sistema.',
                        type: 'error',
                        buttonsStyling: false,
                        confirmButtonClass: 'btn btn-sm btn-light',
                        background: 'rgba(0, 0, 0, 0.96)'
                    })
                } else {
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
                    "<i class='zmdi zmdi-delete zmdi-hc-lg' onclick='deleteFolder(this)' folder="+element.folder+"></i>"]).draw();
            });
        }
    }
    xmlhttp.send();
}

function deleteFolder(e) {
    alert(e.getAttribute("folder")+": mi cancello")
}