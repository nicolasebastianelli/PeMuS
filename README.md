# PeMuS ![Electron][electron] ![Node.js][node] ![License][license]

## Personal Multimedia Server

Distributed application for sharing and stream multimedia files.


### Goal: 

Create a distributed cross-platform application that gives to the users the possibility to share local multimedia files, like music and video, and stream other users local files.

For requests from the same local network will be possible to use the browser as client, for connection from external networks will be used the PeerJS framework over the WebRTC protocol to grant a Peer-to-Peer architecture and WebTorrent framework for stream the files via torrent.

Due to the distributed nature of the project a field test is required, so to test the prototype will be used Mininet, a software for creating a virtual network over the same machine.


### Main Technologies:
- [Node.js](https://nodejs.org/it/)	
- [Electron](https://electronjs.org/)
- [Express](http://expressjs.com/it/)
- [Peerjs](https://github.com/peers/peerjs)
- [WebTorrent](https://webtorrent.io/intro)


### Architecture:

<img src="https://image.ibb.co/m0pXLd/Untitled.png" width="600">

### License

Distributed under the [GPL-3.0](LICENSE) license.

Fully developed by [Nicola Sebastianelli](https://www.linkedin.com/in/nicolasebastianelli/), 2018

[electron]: https://img.shields.io/badge/Electron-v1.7.9-blue.svg
[node]: https://img.shields.io/badge/Node.js-v8.9.1-brightgreen.svg
[license]: https://img.shields.io/badge/License-GPL--3.0-red.svg

