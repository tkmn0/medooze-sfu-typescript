let _ws = null;
let _stream = null;
let _peer = null;
const video_width = 320;
const video_height = 180;

window.onload = () => {
    init();
};

const joinButtonClicked = () => {
    setupConnection();
};

const init = async () => {
    setupClient();
    _stream = await setupVideoStream(true);
};

const setupConnection = async () => {
    try {
        // _ws = await setupWs('ws://52.194.251.26:3000');
        _ws = await setupWs('ws://52.194.251.26/sfu/');

        _peer = prepareNewConnection(true, _stream);
        makeOfferAsync(_peer);
    } catch (e) {
        console.log(e);
    }
};

const setupClient = () => {
    document.getElementById('roomName').value = 'test';//Math.random().toString(36).slice(-8);
    document.getElementById('userName').value = Math.random().toString(36).slice(-8);
    document.getElementById('joinButton').onclick = joinButtonClicked;
}

const ClientModel = () => {

    return {
        roomName: document.getElementById('roomName').value,
        userName: document.getElementById('userName').value
    }
}

const setupWs = (url) => {

    console.log("ws url:", url);
    return new Promise((resolve, reject) => {
        let ws = new WebSocket(url);

        ws.onmessage = (ev) => {
            let data = ev.data;
            let message = JSON.parse(data);
            switch (message.type) {
                case 'answer':
                    setAnswerAsync(message.sdp, _peer);
                    break;
                case 'update':
                    updateSDPAsync(message.sdp, _peer);
                    break;
            }
        };

        ws.onopen = () => {
            resolve(ws);
        };

        ws.onerror = (e) => {
            reject(e);
        }
    });
};

const sendSDP = (sessionDescription) => {
    const message = JSON.stringify({ type: sessionDescription.type, sdp: sessionDescription.sdp, roomName: ClientModel().roomName, userName: ClientModel().userName });
    _ws.send(message);
};

const setupVideoStream = async (file) => {
    const videoElement = document.createElement('video');
    videoElement.width = video_width;
    videoElement.height = video_height;
    document.body.appendChild(videoElement);

    console.log("file stream:", file);
    if (file) {
        videoElement.src = "./media/BigBuckBunny.mp4";
        videoElement.play();
        videoElement.controls = true;
        videoElement.loop = true;
        videoElement.muted = true;

        return stream = videoElement.captureStream();
    } else {
        let stream = await navigator.mediaDevices.getUserMedia({ video: { width: { exact: 3840 } }, audio: true });
        videoElement.srcObject = stream;
        await videoElement.play();
        return stream;
    }
};

const addVideoForStream = async (stream, muted) => {
    const video = document.createElement("video");
    video.id = stream.id;
    video.srcObject = stream;
    video.width = video_width;
    video.height = video_height;

    video.controls = true;
    document.body.appendChild(video);
    await video.play();
};

const removeVideoForStream = (stream) => {
    var video = document.getElementById(stream.id);
    video.style.display = 'none';
    video.addEventListener('webkitTransitionEnd', function () {
        video.parentElement.removeChild(video);
    });
    video.className = "disabled";
}

const prepareNewConnection = (isOffer, stream) => {

    const pc_config = {
        "iceServers": [{ "urls": "stun:stun.webrtc.ecl.ntt.com:3478" }],
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
        sdpSemantics: "plan-b"
    };

    const _peer = new RTCPeerConnection(pc_config);

    _peer.onaddstream = evt => {
        console.log('-- peer.onstream()');
        addVideoForStream(evt.stream);
    };

    _peer.onremovestream = (event) => {
        console.log("pc::onRemoveStream", event);
        removeVideoForStream(event.stream);
    };

    _peer.oniceconnectionstatechange = function () {
        console.log('ICE connection Status has changed to ' + _peer.iceConnectionState);
        switch (_peer.iceConnectionState) {
            case 'closed':
            case 'failed':
                if (_peer) {
                    // hangup
                }
                break;
            case 'dissconnected':
                break;
        }
    };

    if (stream) {
        console.log('Adding local stream...');
        _peer.addStream(stream);
    } else {
        console.warn('no local stream, but continue.');
    }

    return _peer;
}

function playVideo(element, stream) {
    element.srcObject = stream;
    element.play();
}

/**
 * @param {RTCPeerConnection} peer RTCPeerConnection
 */
const makeOfferAsync = async (peer) => {
    try {
        let offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        sendSDP(peer.localDescription);
    } catch (e) {
        console.log(e);
    }
};

/**
 * @param {stirng} sdp sting
 * @param {RTCPeerConnection} peer RTCPeerConnection
 */
const setAnswerAsync = async (sdp, peer) => {
    const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: sdp
    });

    await peer.setRemoteDescription(answer);
}

/**
 * @param {stirng} sdp sting
 * @param {RTCPeerConnection} peer RTCPeerConnection
 */
const updateSDPAsync = async (sdp, peer) => {
    const offer = new RTCSessionDescription({
        type: 'offer',
        sdp: sdp
    });

    try {
        await peer.setRemoteDescription(offer);

        const answer = await peer.createAnswer();

        await peer.setLocalDescription(answer);
    } catch (e) {
        console.log('updaate error: ', e);
    }
}