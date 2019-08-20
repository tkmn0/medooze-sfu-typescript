'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const config_1 = require("../config/config");
const Http = require("http");
class WebSocketServer {
    constructor() {
        this.updateSDP = (message) => {
            var socket = this.connections.get(message.userName);
            if (socket) {
                socket.send(JSON.stringify(message));
            }
        };
        const httpServer = Http.createServer();
        // this.server = new WebSocket.Server({ port: CONFIG.signaling.port });
        this.server = new WebSocket.Server({ server: httpServer });
        this.connections = new Map();
        this.setupServer();
        httpServer.listen(config_1.CONFIG.signaling.port);
    }
    setupServer() {
        this.server.on('connection', (socket) => {
            socket.on('message', (data) => {
                let message = JSON.parse(data.toString());
                switch (message.type) {
                    case 'offer':
                        console.log('offer from ' + message.userName);
                        this.connections.set(message.userName, socket);
                        if (this.signalingDelegate && this.signalingDelegate.onOffer) {
                            this.signalingDelegate.onOffer(message);
                        }
                        break;
                    default:
                        console.log(message.type + ' received');
                        break;
                }
            });
        });
        this.server.on('listening', () => {
            console.log("server listenin on " + config_1.CONFIG.signaling.port);
        });
    }
}
exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=websocketServer.js.map