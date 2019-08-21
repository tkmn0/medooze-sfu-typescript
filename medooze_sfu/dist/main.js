'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const websocketServer_1 = require("./signaling/websocketServer");
const sfu_1 = require("./sfu/sfu");
class Main {
    constructor() {
        let signalingServer = new websocketServer_1.WebSocketServer();
        let sfuServer = new sfu_1.Sfu(signalingServer);
    }
}
const main = new Main();
//# sourceMappingURL=main.js.map