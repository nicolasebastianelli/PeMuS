var WebTorrent = require('webtorrent');

var client = new WebTorrent();
client.add("magnet:?xt=urn:btih:95c7b8e48e3a88d6ad9cfba44abbbdc9ff4b89ae&dn=Voldemort.mp4&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com", function (torrent) {
    // Got torrent metadata!
    console.log('Torrent info hash:', torrent.infoHash);


        // append download link
        torrent.files[0].getBlobURL(function (err, url) {
            if (err) return util.error(err);

            var a = document.createElement('a');
            a.target = '_blank';
            a.download = torrent.files[0].name;
            a.href = url;
            a.textContent = 'Download ' + torrent.files[0].name;
            console.log(a)
        })

    // append file
    torrent.files[0].appendTo('body', {
        maxBlobLength: 2 * 1000 * 1000 * 1000 // 2 GB
    }, function (err, elem) {
        if (err) return util.error(err)
    });
});