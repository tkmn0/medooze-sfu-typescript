import { Participant } from "./participant";
import { MediaServer, Endpoint, IncomingStream } from "medooze-media-server";
import { EventEmitter } from "events";
import { SupportedMedia } from "semantic-sdp";
import { CONFIG } from "../config/config";

const Medooze: MediaServer = require("medooze-media-server");

export class Room {
  private participants: Map<string, Participant>;
  private id: string;
  private uri: string[];
  private endpoint: Endpoint;
  private capabilities: { [k: string]: SupportedMedia };
  emitter: EventEmitter;

  getEndpoint = () => this.endpoint;
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
        codecs: ["opus"],
        extensions: [
          "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
          "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
        ],
        rtcpfbs: [],
      },
      video: {
        codecs: [CONFIG.sfu.video_codec],
        rtx: true,
        rtcpfbs: [
          { id: "transport-cc" },
          { id: "ccm", params: ["fir"] },
          { id: "nack" },
          { id: "nack", params: ["pli"] },
        ],
        extensions: [
          "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
          "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
        ],
      },
    };

    this.endpoint = Medooze.createEndpoint(ip);
  }

  createParticipant = (name: string): Participant => {
    const participant = new Participant(name, this);

    participant.streamEmitter.on((stream) => {
      for (let other of this.participants.values()) {
        if (other.getName() != participant.getName()) {
          other.addStream(stream);
        }
      }
    });

    participant.stoppedEmitter.on(() => {
      console.log("participant stoped: " + participant.getName());
      this.participants.delete(participant.getName());
    });

    this.participants.set(participant.getName(), participant);
    return participant;
  };

  getParticipant(userName: string) {
    return this.participants.get(userName);
  }

  stopParticipant(userName: string) {
    this.participants.get(userName).stop();
  }

  getStreams = (): IncomingStream[] => {
    const streams: IncomingStream[] = [];

    for (let participant of this.participants.values())
      for (let stream of participant.getIncomingStreams()) streams.push(stream);

    return streams;
  };
}
