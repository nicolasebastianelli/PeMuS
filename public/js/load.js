function updateTheme() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://"+window.location.hostname.toString()+":8080/getCurrentTheme", true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementsByTagName("body")[0].setAttribute("data-sa-theme", xhr.responseText);
                document.getElementById("label-theme-" + xhr.responseText).className += " active"
                document.getElementById("theme-" + xhr.responseText).checked = true;
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.send();
}

function updateUser() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://"+window.location.hostname.toString()+":8080/getUser", true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementById("ip").innerHTML=window.location.hostname;
                document.getElementById("user").innerHTML=xhr.responseText;
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.send();
}

function updateUserMessage() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://"+window.location.hostname.toString()+":8080/getUser", true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                document.getElementById("ipMsg").innerHTML="at the ip: "+window.location.hostname;
                document.getElementById("userMsg").innerHTML="You are connected to the user: "+xhr.responseText;
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.send();
}