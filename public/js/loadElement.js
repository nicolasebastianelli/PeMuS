
function loadElem() {
    updateTheme();
    updateUser();
}

function updateTheme() {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://localhost:8080/getTheme", true);
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
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://localhost:8080/setTheme?theme="+document.getElementById(id).getAttribute("value"), true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var resp = xmlhttp.responseText;
        }
    }
    xmlhttp.send();
}

function updateUser() {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://localhost:8080/getUserInfo", true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var resp=JSON.parse(xmlhttp.responseText);
            document.getElementById("User").innerHTML=resp[0];
            document.getElementById("Ip").innerHTML=resp[1];
        }
    }
    xmlhttp.send();
}