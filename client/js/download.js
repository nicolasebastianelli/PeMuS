var WebTorrent = require('webtorrent');

var client = new WebTorrent();
client.add("magnet:?xt=urn:btih:0aed33f806b4703f91f5e12ca6dfccce6a4b632b&dn=4.mp4&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com", function (torrent) {
    // Got torrent metadata!
    console.log('Torrent info hash:', torrent.infoHash);


        // append download link
        torrent.files[0].getBlobURL(function (err, url) {
            if (err) return util.error(err);

            var a = document.getElementById('download');
            a.target = '_blank';
            a.download = torrent.files[0].name;
            a.href = url;
            a.textContent = 'Download ' + torrent.files[0].name;

            var video = document.getElementById("myVideo");
            video.src = url;
            video.load();
            video.onloadeddata = function() {
                video.play();
            }
            console.log(a)
        });

});