'use strict';
import { ISignalingServer } from "./signaling/signalingServerInterface";
import { WebSocketServer } from "./signaling/websocketServer";
import { Sfu } from "./sfu/sfu";

class Main {

    constructor() {
        let signalingServer: ISignalingServer = new WebSocketServer();
        let sfuServer = new Sfu(signalingServer);
    }
}

const main = new Main();