import { Room } from "./room";
import { SignalingMessage } from "../data/signalingMessage";
import { ISignalingServer } from "../signaling/signalingServerInterface";
import { SignalingDelegate } from "../signaling/signalingDelegate";
import { SDPInfo } from "semantic-sdp";
import * as IP from "ip";
import { MediaServer } from "medooze-media-server";
import { CONFIG } from "../config/config";
const Medooze: MediaServer = require("medooze-media-server");
import { exec } from "child_process";

export class Sfu implements SignalingDelegate {

    private ipAddress: string;
    private rooms: Map<string, Room>;
    private signalingServer: ISignalingServer;

    constructor(server: ISignalingServer) {

        Medooze.enableDebug(CONFIG.sfu.enable_log);
        Medooze.enableLog(CONFIG.sfu.enable_log);
        Medooze.enableUltraDebug(CONFIG.sfu.enable_log);

        this.signalingServer = server;
        this.signalingServer.signalingDelegate = this;

        this.SetupAsync();
    }

    private SetupAsync = async () => {
        this.ipAddress = IP.address();
        if (CONFIG.environment == 'production') {
            this.ipAddress = await this.getGlobalIpAddressAsync();
        }
        this.rooms = new Map();
    };

    private getGlobalIpAddressAsync = async (): Promise<string> => {
        return new Promise((resolve, reject) => {
            exec('curl ifconfig.moe', (err, stdout) => {
                if (err) {
                    reject(err);
                }
                resolve(stdout.trim());
            });
        });
    };

    onOffer = (message: SignalingMessage) => {
        let room = this.rooms.get(message.roomName);

        if (!room) {
            console.log("no room, create...");
            room = new Room(message.roomName, this.ipAddress);
            this.rooms.set(message.roomName, room);
        }

        if (this.isExistParticipant(message.userName)) {
            console.log("-- already exist remove it..");
            room.stopParticipant(message.userName);
        }

        const participant = room.createParticipant(message.userName);

        const streams = room.getStreams();

        const sdp = SDPInfo.process(message.sdp);

        try {
            participant.init(sdp);
        } catch (e) {
            console.log("participant initialize error: " + e);
            return;
        }

        for (let stream of streams) {
            participant.addStream(stream);
        }

        const answer = participant.getLocalSDP();
        const answerSDP = answer.toString();

        let answerMessage = new SignalingMessage({
            type: 'answer',
            sdp: answerSDP,
            userName: message.userName,
            roomName: message.roomName
        });

        this.signalingServer.updateSDP(answerMessage);

        for (let stream of sdp.getStreams().values()) {
            participant.publishStream(stream);
        }

        participant.reNegotiationEmitter.on((sdp) => {
            console.log(participant.getName(), 'renegotiation needed');

            const updateMessage = new SignalingMessage({
                type: 'update',
                sdp: sdp.toString(),
                userName: message.userName,
                roomName: message.roomName
            });

            this.signalingServer.updateSDP(updateMessage);
        });
    }

    onClose = () => { };

    private isExistParticipant = (roomName: string): boolean => {
        for (let room of this.rooms.values()) {
            let result = room.getParticipant(roomName);
            if (result != null) {
                return true;
            }
        }
        return false;
    };
}