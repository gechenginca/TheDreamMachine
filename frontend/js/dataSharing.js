// This code is inspired of
// "Tutorial - Data Channels with WebRTC in Node.js"
// by Jonathan N. Lee
// https://jon--lee.github.io/blog/2015/09/29/DataChannels-with-WebRTC.html

var roomId = 0;
var line_history = null;

var Channel = {
    socket: io(),
    getReady: function(){
        Channel.socket.on('join', Channel.onJoin);
        Channel.socket.on('ready', Channel.onReady);
        Channel.socket.on('connectClient', Channel.onConnectClient);
        Channel.socket.on('full', Channel.onFull);
        Channel.socket.on('answer', Channel.onAnswer);
        Channel.socket.on('offer', Channel.onOffer);
        Channel.socket.emit('join', roomId);
        roomId++;
    },
    onIceCandidate: function(event){
        if (event.candidate){
            Channel.socket.emit('candidate', JSON.stringify(event.candidate));
        }
    },
    onCandidate: function(candidate){
        rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
        Channel.peerConnection.addIceCandidate(rtcCandidate);
    },
    establishConnection: function(){
        Channel.handlePeerConnection();
        Channel.createOffer();
    },
    handlePeerConnection: function(){ // Consider add TURN server later
        Channel.peerConnection = new RTCPeerConnection({
            iceServers: [{urls: "stun:global.stun.twilio.com:3478?transport=udp" }]
        });
        Channel.peerConnection.onicecandidate = Channel.onIceCandidate;
        Channel.peerConnection.ondatachannel = Channel.receiveChannelCallback;
        Channel.socket.on('candidate', Channel.onCandidate);
    },
    createOffer: function(){
        Channel.createDataChannel('label');
        console.log('data channel created, creating offer');
        Channel.peerConnection.createOffer(
            function(offer){
                Channel.peerConnection.setLocalDescription(offer);
                Channel.socket.emit('offer', JSON.stringify(offer));
            },
            function(err){
                console.log(err);
            }
        );
    },
    sendData: function(line_history){
        console.log('sending data to the peer');
        Channel.dataChannel.send(line_history);
    },
    onJoin: function(){
        console.log('onJoin');
        // Channel.readyButton.setAttribute('disabled', 'disabled');
    },
    onReady: function(line_history){
        console.log('onReady');
        Channel.establishConnection();
        line_history = line_history;
        setTimeout(function() {
            Channel.sendData(line_history);
        }, 1000);

        // var build = new Promise(function(resolve, reject) {
        //     Channel.establishConnection();
        //     line_history = line_history;
        //     resolve();
        // });
        // build.then(setTimeout(function() {
        //     Channel.sendData(line_history);
        // }), 1000);

        // Channel.connectButton.removeAttribute('disabled');
        // var connect = new Promise(function(resolve, reject) {
        //     Channel.establishConnection();
        //     resolve(room);
        // });
        // connect.then(function(fullfilled) {
        //     Channel.socket.emit('connectClient', room);
        // });

        // setTimeout(function() {
        //     Channel.socket.emit('connectClient', room);
        // }, 1000);
    },
    onConnect: function(room){
        Channel.establishConnection();
    },
    onFull: function(){
        console.log('room is full');
    },
    onAnswer: function(answer){
        // console.log('on answer');
        var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
        Channel.peerConnection.setRemoteDescription(rtcAnswer);
    },
    onOffer: function(offer){
        Channel.handlePeerConnection();
        Channel.createAnswer(offer);
    },
    createAnswer: function(offer){
        // console.log('creating answer');
        var rtcOffer = new RTCSessionDescription(JSON.parse(offer));
        Channel.peerConnection.setRemoteDescription(rtcOffer);
        Channel.peerConnection.createAnswer(
            function(answer){
                Channel.peerConnection.setLocalDescription(answer);
                Channel.socket.emit('answer', JSON.stringify(answer));
            },
            function(err){
                console.log(err);
            }
        );
    },
    createDataChannel: function(label){
        console.log('creating data channel');
        Channel.dataChannel = Channel.peerConnection.createDataChannel(label, Channel.dataChannelOptions);
        Channel.dataChannel.onerror = function(err){
            console.log(err);
        };
        Channel.dataChannel.onmessage = function(event) {
            console.log('got channel message: ' + event.data);
        };

        Channel.dataChannel.onopen = function(){
            console.log('data channel opened');
            Channel.dataChannel.send("Hello World!");
            // Channel.sendButton.removeAttribute('disabled');
            // Channel.connectButton.setAttribute('disabled', 'disabled');
        };

        Channel.dataChannel.onclose = function(){
            console.log('channel closed');
        };
    },
    receiveChannelCallback: function(event){
        console.log('received callback');
        var receiveChannel = event.channel;
        receiveChannel.onopen = function(){
            console.log('receive channel event open');
        };
        receiveChannel.onmessage = function(event){
            line_history = event.data;
            console.log('receive channel event: ' + event.data);
        };
    }
};
(function() {
    window.onload = function() {
        Channel.getReady();
    };
}());
// Channel.readyButton = document.getElementById('ready');
// Channel.readyButton.addEventListener('click', Channel.getReady, false);

// Channel.connectButton = document.getElementById('connect');
// Channel.connectButton.addEventListener('click', Channel.establishConnection, false);

Channel.sendButton = document.getElementById('send-data');
Channel.sendButton.addEventListener('click', Channel.sendData, false);