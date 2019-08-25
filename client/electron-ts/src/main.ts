import { SfuClient } from "./webrtc/sfu_client";
import { CONFIG } from "./config";

class Main {
    private sfuClient: SfuClient;

    constructor() {
        //this.sfuClient = new SfuClient("ws://lcoalhost:3000");
        //this.sfuClient.onStream = this.onStream;

        console.log(CONFIG.webrtc.video_type);
    }

    private onStream = (stream: MediaStream) => {
        console.log("onstream: ", stream);
    };
}

let main: Main
window.onload = () => {
    main = new Main();
};