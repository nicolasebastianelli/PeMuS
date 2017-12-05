
var ip ="localhost";
var port="4242"

function updateTheme() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://"+ip+":"+port+"/getTheme", true);
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
    xmlhttp.open("GET","http://localhost:"+port+"/setTheme?theme="+document.getElementById(id).getAttribute("value"), true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var resp = xmlhttp.responseText;
        }
    }
    xmlhttp.send();
}

function updateUser() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","http://"+ip+":"+port+"/getUserInfo", true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var resp=JSON.parse(xmlhttp.responseText);
            document.getElementById("ip").innerHTML=resp[1];
            document.getElementById("user").innerHTML=resp[0];
        }
    }
    xmlhttp.send();
}