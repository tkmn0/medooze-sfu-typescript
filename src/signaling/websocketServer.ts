'use strict';
import * as WebSocket from "ws"
import { SignalingMessage } from "../data/signalingMessage";
import { ISignalingServer } from "./signalingServerInterface";
import { SignalingDelegate } from "./signalingDelegate";
import { CONFIG } from "../config/config";

export class WebSocketServer implements ISignalingServer {
    private server: WebSocket.Server;
    private connections: Map<string, WebSocket>;
    signalingDelegate: SignalingDelegate;

    constructor() {
        this.server = new WebSocket.Server({ port: CONFIG.signaling.port });
        this.connections = new Map<string, WebSocket>();
        this.setupServer();
    }

    private setupServer() {
        this.server.on('connection', (socket) => {

            socket.on('message', (data: WebSocket.Data) => {
                let message: SignalingMessage = JSON.parse(data.toString());
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
            console.log("server listenin on " + this.server.options.port);
        });
    }

    updateSDP = (message: SignalingMessage) => {
        var socket = this.connections.get(message.userName);

        if (socket) {
            socket.send(JSON.stringify(message));
        }
    };
}