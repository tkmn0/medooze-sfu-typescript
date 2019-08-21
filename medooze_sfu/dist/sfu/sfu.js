"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_1 = require("./room");
const signalingMessage_1 = require("../data/signalingMessage");
const semantic_sdp_1 = require("semantic-sdp");
const IP = require("ip");
const config_1 = require("../config/config");
const Medooze = require("medooze-media-server");
const child_process_1 = require("child_process");
class Sfu {
    constructor(server) {
        this.SetupAsync = async () => {
            this.ipAddress = IP.address();
            if (config_1.CONFIG.environment == 'production') {
                this.ipAddress = await this.getGlobalIpAddressAsync();
            }
            this.rooms = new Map();
        };
        this.getGlobalIpAddressAsync = async () => {
            return new Promise((resolve, reject) => {
                child_process_1.exec('curl ifconfig.moe', (err, stdout) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(stdout.trim());
                });
            });
        };
        this.onOffer = (message) => {
            let room = this.rooms.get(message.roomName);
            if (!room) {
                console.log("no room, create...");
                room = new room_1.Room(message.roomName, this.ipAddress);
                this.rooms.set(message.roomName, room);
            }
            if (this.isExistParticipant(message.userName)) {
                console.log("-- already exist remove it..");
                room.stopParticipant(message.userName);
            }
            const participant = room.createParticipant(message.userName);
            const streams = room.getStreams();
            const sdp = semantic_sdp_1.SDPInfo.process(message.sdp);
            try {
                participant.init(sdp);
            }
            catch (e) {
                console.log("participant initialize error: " + e);
                return;
            }
            for (let stream of streams) {
                participant.addStream(stream);
            }
            const answer = participant.getLocalSDP();
            const answerSDP = answer.toString();
            let answerMessage = new signalingMessage_1.SignalingMessage({
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
                const updateMessage = new signalingMessage_1.SignalingMessage({
                    type: 'update',
                    sdp: sdp.toString(),
                    userName: message.userName,
                    roomName: message.roomName
                });
                this.signalingServer.updateSDP(updateMessage);
            });
        };
        this.onClose = () => { };
        this.isExistParticipant = (roomName) => {
            for (let room of this.rooms.values()) {
                let result = room.getParticipant(roomName);
                if (result != null) {
                    return true;
                }
            }
            return false;
        };
        Medooze.enableDebug(config_1.CONFIG.sfu.enable_log);
        Medooze.enableLog(config_1.CONFIG.sfu.enable_log);
        Medooze.enableUltraDebug(config_1.CONFIG.sfu.enable_log);
        this.signalingServer = server;
        this.signalingServer.signalingDelegate = this;
        this.SetupAsync();
    }
}
exports.Sfu = Sfu;
//# sourceMappingURL=sfu.js.map