"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typedEvent_1 = require("../common/typedEvent");
const config_1 = require("../config/config");
class Participant {
    constructor(name, room) {
        this.isStopped = false;
        this.streamEmitter = new typedEvent_1.TypedEvent();
        this.reNegotiationEmitter = new typedEvent_1.TypedEvent();
        this.stoppedEmitter = new typedEvent_1.TypedEvent();
        this.getName = () => this.name;
        this.getRemoteSDP = () => this.remoteSDP;
        this.getLocalSDP = () => this.localSDP;
        this.getIncomingStreams = () => this.incomingStreams.values();
        this.init = (sdp) => {
            const endpoint = this.room.getEndpoint();
            this.transport = endpoint.createTransport(sdp);
            this.transport.setRemoteProperties(sdp);
            const answer = sdp.answer({
                dtls: this.transport.getLocalDTLSInfo(),
                ice: this.transport.getLocalICEInfo(),
                candidates: endpoint.getLocalCandidates(),
                capabilities: this.room.getCapabilities()
            });
            this.transport.setLocalProperties({
                audio: sdp.getMedia('audio'),
                video: sdp.getMedia('video')
            });
            this.localSDP = answer;
            this.remoteSDP = sdp;
        };
        this.addStream = (stream) => {
            const outgoingStream = this.transport.createOutgoingStream({
                video: true,
                audio: true,
            });
            const info = outgoingStream.getStreamInfo();
            this.localSDP.addStream(info);
            this.outgoingStreams.set(outgoingStream.getId(), outgoingStream);
            this.reNegotiationEmitter.emit(this.localSDP);
            outgoingStream.attachTo(stream);
            stream.on('stopped', () => {
                if (!this.outgoingStreams) {
                    return;
                }
                this.outgoingStreams.delete(outgoingStream.getId());
                this.localSDP.removeStream(info);
                this.reNegotiationEmitter.emit(this.localSDP);
                outgoingStream.stop();
            });
        };
        this.publishStream = (stream) => {
            if (!this.transport)
                throw Error("Not inited");
            const incomingStream = this.transport.createIncomingStream(stream);
            this.incomingStreams.set(incomingStream.getId(), incomingStream);
            this.streamEmitter.emit(incomingStream);
            let videoTrack = incomingStream.getVideoTracks()[0];
            if (config_1.CONFIG.sfu.check_media_stream_alive) {
                if (videoTrack) {
                    let totalReceivedVideoBytes = 0;
                    let observeBytes = setInterval(() => {
                        let stats = videoTrack.getStats()[''];
                        let media = stats['media'];
                        if (totalReceivedVideoBytes === media.totalBytes) {
                            if (!this.isStopped) {
                                this.stop();
                            }
                            clearInterval(observeBytes);
                        }
                        totalReceivedVideoBytes = media.totalBytes;
                    }, 1000);
                }
            }
        };
        this.name = name;
        this.room = room;
        this.incomingStreams = new Map();
        this.outgoingStreams = new Map();
    }
    stop() {
        if (this.isStopped) {
            return;
        }
        //remove all published streams
        for (let stream of this.incomingStreams.values()) {
            //Stop it
            stream.stop();
        }
        //Remove all emitting streams
        for (let stream of this.outgoingStreams.values()) {
            //Stop it
            stream.stop();
        }
        //IF we hve a transport
        if (this.transport) {
            //Stop transport
            this.transport.stop();
        }
        //Clean them
        this.room = null;
        this.incomingStreams = null;
        this.outgoingStreams = null;
        this.transport = null;
        this.localSDP = null;
        this.remoteSDP = null;
        this.isStopped = true;
        //Done
        this.stoppedEmitter.emit(null);
    }
}
exports.Participant = Participant;
//# sourceMappingURL=participant.js.map