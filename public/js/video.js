var lan ="192.168.1."
var users = []


function scanLan() {
    var xmlhttp = [];
    for (var i=1; i<255; i++){
        (function(i) {
            xmlhttp[i] = new XMLHttpRequest();
            xmlhttp[i].open("GET","http://"+lan+i+":"+port+"/getUserInfo", true);
            xmlhttp[i].onreadystatechange = function () {
                if (xmlhttp[i].readyState === 4 && xmlhttp[i].status === 200) {
                    var resp = xmlhttp[i].responseText;
                    users.push(resp);
                }
            };
            xmlhttp[i].send(null);
        })(i);
    }
    alert(users);
}