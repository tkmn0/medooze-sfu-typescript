import { Participant } from "./participant";
import { MediaServer, Endpoint, IncomingStream, Streamer, CreateStreamerSessionOptions, CreateTransportOptions,IncomingStreamTrackStatsReport  } from "medooze-media-server";
import { EventEmitter } from "events";
import { SupportedMedia, StreamInfo, MediaInfo, CodecInfo, ICEInfo, DTLSInfo, Setup } from "semantic-sdp";
import { CONFIG } from "../config/config";
const SemanticSDP = require("semantic-sdp");
const MediaInfoNode = SemanticSDP.MediaInfo;
const CodecInfoNode = SemanticSDP.CodecInfo;
const StreamInfoNode = SemanticSDP.StreamInfo;

const Medooze: MediaServer = require("medooze-media-server");

export class Room {

    private participants: Map<string, Participant>;
    private id: string;
    private uri: string[];
    private endpoint: Endpoint;
    private streamer: Streamer;
    private capabilities: { [k: string]: SupportedMedia }
    emitter: EventEmitter;

    getEndpoint = () => this.endpoint;
    getStreamer = () => this.streamer;
    getCapabilities = () => this.capabilities;
    getUri = () => this.uri;
    getId = () => this.id;

    constructor(id: string, ip: string) {
        this.id = id;
        //Create uri
        this.uri = ["rooms", id];

        this.participants = new Map<string, Participant>();

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
                codecs: [CONFIG.sfu.video_codec],
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
        }

        this.endpoint = Medooze.createEndpoint(ip);
        this.streamer = Medooze.createStreamer();
    }

    createParticipant = (name: string): Participant => {
        const participant = new Participant(name, this);
        participant.streamEmitter.on((stream) => {
            for (let other of this.participants.values()) {
                if (other.getName() != participant.getName()) {
                    other.addStream(stream);
                }
            }

            this.createRtpOutput(stream, {
                remote: {
                    ip: "192.168.1.189",
                    port: 5003
                }
            });
        });

        participant.stoppedEmitter.on(() => {
            console.log('participant stoped: ' + participant.getName());
            this.participants.delete(participant.getName());
        });

        this.participants.set(participant.getName(), participant);
        return participant;
    }

    getParticipant(userName: string) {
        return this.participants.get(userName);
    }

    stopParticipant(userName: string) {
        this.participants.get(userName).stop();
    }

    getStreams = (): IncomingStream[] => {
        const streams: IncomingStream[] = [];

        for (let participant of this.participants.values())
            for (let stream of participant.getIncomingStreams())
                streams.push(stream);

        return streams;
    };

    CreateRtpInput = (option: CreateStreamerSessionOptions) =>{
        let mediaInfo: MediaInfo = new MediaInfoNode('media', 'video');
        mediaInfo.addCodec(new CodecInfoNode('h264', 96));
        mediaInfo.setBitrate(1024);
        console.log(mediaInfo);

        var streamerSession = this.streamer.createSession(mediaInfo, option);
        console.log(streamerSession);
        let streamInfo: StreamInfo = new StreamInfoNode("stream_loopback");
        var streamTrack = streamerSession.getIncomingStreamTrack();
        var outgoingTrack = streamerSession.getOutgoingStreamTrack();
        let observeBytes = setInterval(() => {
            // console.log(streamTrack.getStats());
            // console.log(outgoingTrack.getStats());
        }, 1000);
        
        var trackInfo = streamTrack.getTrackInfo();
        trackInfo.addSSRC(34123324);
        trackInfo.setMediaId("loopbackTrack");
        streamInfo.addTrack(trackInfo);

        this.participants.forEach(p => {
            p.addStreamInfo(streamerSession.getIncomingStreamTrack());
        });
    };

    createRtpOutput = (incommingStream: IncomingStream, networkOptions: CreateStreamerSessionOptions) => {
        let mediaInfo = new MediaInfoNode('media', 'video');
        mediaInfo.addCodec(new CodecInfoNode('h264', 96));
        let streamerSession = this.streamer.createSession(mediaInfo, networkOptions);
        let outgoingStreamTrack = streamerSession.getOutgoingStreamTrack();
        outgoingStreamTrack.attachTo(incommingStream.getTracks("video")[0]);
    };
}