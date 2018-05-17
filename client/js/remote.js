var fs = require('fs');
var xml2js = require('xml2js');
var os = require('os');
var Peer = require('peerjs');
var port =process.env.PORT;
var portServer =3000;
var hostServer ='localhost';

var peer = new Peer('12345678', {
    host: hostServer,
    port: portServer,
    path: '/peerjs'
});

peer.on('open', function(id) {
    console.log('My peer ID is: ' + id);
});

peer.on('error', function(err){
    console.log('Connection error');
});

function sendRequest(){
    peerID='87654321';
    var conn = peer.connect(peerID,{
        metadata: {
            name: 'Nicola'
        }
    });
    conn.on('open', function() {
        console.log('Connected to ', peerID);

        // Receive messages
        conn.on('data', function(data) {
            console.log('Received', data);
            conn.close();
        });

        // Send messages
        conn.send('Hello from phone!');



    });

    conn.on('close', function() {

        console.log('Connection closed');
    });

}