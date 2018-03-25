// This code is inspired of
// "Tutorial - Data Channels with WebRTC in Node.js"
// by Jonathan N. Lee
// https://jon--lee.github.io/blog/2015/09/29/DataChannels-with-WebRTC.html

var Channel = {
    socket: io(),
    getReady: function(){
        Channel.socket.on('join', Channel.onJoin);
        Channel.socket.on('ready', Channel.onReady);
        Channel.socket.on('full', Channel.onFull);
        Channel.socket.on('answer', Channel.onAnswer);
        Channel.socket.on('offer', Channel.onOffer);
        Channel.socket.emit('join', 'room');
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
                console.log(Channel.peerConnection.setLocalDescription(offer));
                // Channel.peerConnection.setLocalDescription(offer);
                Channel.socket.emit('offer', JSON.stringify(offer));
            },
            function(err){
                console.log(err);
            }
        );
    },
    sendData: function(){
        console.log('sending data to the peer');
        Channel.dataChannel.send('rtc data to be sent');
    },
    onJoin: function(){
        console.log('onJoin');
    },
    onReady: function(){
        console.log('onReady');
        Channel.establishConnection();
        // Channel.sendData();
    },
    onFull: function(){
        console.log('room is full');
    },
    onAnswer: function(answer){
        var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
        Channel.peerConnection.setRemoteDescription(rtcAnswer);
    },
    onOffer: function(offer){
        Channel.handlePeerConnection();
        Channel.createAnswer(offer);
    },
    createAnswer: function(offer){
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
            Channel.sendButton.removeAttribute('disabled');
            Channel.connectButton.setAttribute('disabled', 'disabled');
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
            console.log('receive channel event: ' + event.data);
        };
    }
};
(function() {
    window.onload = function() {
        Channel.getReady();
    };
}());