var line_history;

window.onload = function() {
    var peer = new Peer( { host: "localhost", port: 3000, path: '/peer' });
    // var peer = new Peer( { host: "https://onlinestudytable2018.herokuapp.com/", path: '/peer' });
    socket = io();
    peer.on('connection', function(conn) {
        conn.on('data', function(data) {
            // Will print 'hi!'
            console.log(data);
        });
    });
    peer.on('open', function(id) {
        socket.emit('clientid', id);
    });
    api.getCanvas(function(err, data) {
        line_history = data;
    });
    socket.on('clientid', function(id) {
        var conn = peer.connect(id);

    })
}