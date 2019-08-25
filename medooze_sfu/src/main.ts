'use strict';
import { ISignalingServer } from "./signaling/signalingServerInterface";
import { WebSocketServer } from "./signaling/websocketServer";
import { Sfu } from "./sfu/sfu";
import { CONFIG } from "./config/config";

class Main {

    constructor() {
        console.log(CONFIG);
        let signalingServer: ISignalingServer = new WebSocketServer();
        let sfuServer = new Sfu(signalingServer);
    }
}

const main = new Main();