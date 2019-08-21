"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const participant_1 = require("./participant");
const Medooze = require("medooze-media-server");
const config_1 = require("../config/config");
class Room {
    constructor(id, ip) {
        this.getEndpoint = () => this.endpoint;
        this.getCapabilities = () => this.capabilities;
        this.getUri = () => this.uri;
        this.getId = () => this.id;
        this.createParticipant = (name) => {
            const participant = new participant_1.Participant(name, this);
            participant.streamEmitter.on((stream) => {
                for (let other of this.participants.values()) {
                    if (other.getName() != participant.getName()) {
                        other.addStream(stream);
                    }
                }
            });
            participant.stoppedEmitter.on(() => {
                console.log('participant stoped: ' + participant.getName());
                this.participants.delete(participant.getName());
            });
            this.participants.set(participant.getName(), participant);
            return participant;
        };
        this.getStreams = () => {
            const streams = [];
            for (let participant of this.participants.values())
                for (let stream of participant.getIncomingStreams())
                    streams.push(stream);
            return streams;
        };
        this.id = id;
        //Create uri
        this.uri = ["rooms", id];
        this.participants = new Map();
        this.capabilities = {
            audio: {
                codecs: ['opus'],
                extensions: [
                    "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
                    "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01"
                ],
                rtcpfbs: []
            },
            video: {
                codecs: [config_1.CONFIG.sfu.video_codec],
                rtx: true,
                rtcpfbs: [
                    { "id": "transport-cc" },
                    { "id": "ccm", "params": ["fir"] },
                    { "id": "nack" },
                    { "id": "nack", "params": ["pli"] },
                ],
                extensions: [
                    "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
                    "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01"
                ],
            }
        };
        this.endpoint = Medooze.createEndpoint(ip);
    }
    getParticipant(userName) {
        return this.participants.get(userName);
    }
    stopParticipant(userName) {
        this.participants.get(userName).stop();
    }
}
exports.Room = Room;
//# sourceMappingURL=room.js.map