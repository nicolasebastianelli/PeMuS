const {app,BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const portFinder = require('portfinder');
const fork = require('child_process').fork;
const ipcMain = require('electron').ipcMain;
const globalShortcut = require("electron").globalShortcut;
let win;

child = fork('client/js/torrent.js');

child.on('message', (m) => {
    if(m.type==="updatedMusic"){
        win.webContents.send("updatedMusic",m.data);
    }
    if(m.type==="updatedVideo"){
        win.webContents.send("updatedVideo",m.data);
    }
});

ipcMain.on('updateMusic', function() {
    child.send('updateMusic');
});

ipcMain.on('updateVideo', function() {
    child.send('updateVideo');
});

portFinder.getPort(function (err, port) {
    process.env.PORT=port.toString();
});

function createWindow() {
    app.server = require(__dirname + '/routes.js');
    win = new BrowserWindow({
        backgroundColor: '#000000',
        width: 800,
        height: 600,
        show: false
    });

    win.setMenu(null);

    globalShortcut.register("CommandOrControl+D", () => {
        win.webContents.openDevTools();
    });
    globalShortcut.register("CommandOrControl+R", () => {
        win.webContents.reload();
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname,'client/index.html'),
        protocol: 'file',
        slashes: true

    }));

    win.once("ready-to-show", () => {
        win.show();
    });

    win.on("closed", () => {
        win = null
    });
}

app.on("ready", () =>{
    createWindow();
});

app.on("window-all-closed", () => {
    // Su macOS le applicazioni e la loro barra dei menu rimangono attive
    // finché l'utente non forza la chiusara con Cmd + Q
    if (process.platform !== "darwin") {
     app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});