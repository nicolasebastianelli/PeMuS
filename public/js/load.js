let hostname=window.location.hostname.toString();
let port=window.location.port.toString();


function updateTheme() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "http://"+hostname+":"+port+"/getCurrentTheme", true);
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementsByTagName("body")[0].setAttribute("data-sa-theme", xhr.responseText);
                document.getElementById("label-theme-" + xhr.responseText).className += " active";
                document.getElementById("theme-" + xhr.responseText).checked = true;
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.send();
}

function updateUser() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "http://"+hostname+":"+port+"/getUser", true);
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementById("ip").innerHTML=hostname+":"+port;
                document.getElementById("user").innerHTML=xhr.responseText;
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.send();
}

function updateUserMessage() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "http://"+hostname+":"+port+"/getUser", true);
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementById("ipMsg").innerHTML="IP:&emsp;\""+hostname+":"+port+"\"";
                document.getElementById("userMsg").innerHTML="User:&emsp;\""+xhr.responseText+"\"";
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.send();
}