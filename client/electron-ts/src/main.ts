import { SfuClient } from "./webrtc/sfu_client";

class Main {
    private video_width = 320;
    private video_height = 180;
    private sfuClient: SfuClient;
    private localStream: MediaStream;
    private videoContainer: HTMLElement;

    constructor() {
        this.setupView();
        this.localStream = this.setupStream();
        this.sfuClient = new SfuClient(process.env.SIGNALING_URL);
        this.sfuClient.onStream = this.onStream;
    }

    private setupView = () => {
        this.videoContainer = document.getElementById('videoContainer');
        document.getElementById('webrtcConnectButton').onclick = this.connectButtonClicked;
    };

    private connectButtonClicked = () => {
        console.log("connect");
        this.sfuClient.connect(this.localStream, "test", Math.random().toString(36).slice(-8));
    };

    private setupStream = (): MediaStream => {
        let urlParams = new URLSearchParams(location.search);
        let type = urlParams.get('mediaType');
        const videoElement = document.createElement('video');
        videoElement.width = this.video_width;
        videoElement.height = this.video_height;
        videoElement.id = 'localVideo';
        this.videoContainer.appendChild(videoElement);

        if (type == 'file') {
            videoElement.src = "../media/BigBuckBunny.mp4";
            videoElement.play();
            videoElement.controls = true;
            videoElement.loop = true;
            videoElement.muted = true;

            return (videoElement as any).captureStream();
        }
    };

    private onStream = (stream: MediaStream) => {
        if (stream.id != this.localStream.id)
            this.addVideoForStream(stream);
    };

    private addVideoForStream = async (stream) => {
        const video = document.createElement("video");
        video.id = stream.id;
        video.srcObject = stream;
        video.width = this.video_width;
        video.height = this.video_height;

        this.videoContainer.appendChild(video);
        video.play();
    };
}

let main: Main
window.onload = () => {
    main = new Main();
};