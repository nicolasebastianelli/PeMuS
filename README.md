# PeMuS

### Personal Multimedia Server

Distributed application for sharing and stream multimedia files.


#### Goal: 

Create a distributed cross-platform application that gives to the users the possibility to share local multimedia files, like music and video, and stream other users local files.

For requests from the same local network will be possible to use the browser as client, for connection from external networks will be used the PeerJS framework over the WebRTC protocol to grant a Peer-to-Peer architecture and WebTorrent framework for stream the files.

Due to the distributed nature of the project a field test is required, so to test the prototype will be used Mininet, a software for creating a virtual network over the same machine.


#### Technologies:
[Node.js](https://nodejs.org/it/)	
[Electron](https://electronjs.org/)
[Peerjs](https://github.com/peers/peerjs)
[WebTorrent](https://webtorrent.io/intro)



#### Architecture:

![](https://image.ibb.co/m0pXLd/Untitled.png)

