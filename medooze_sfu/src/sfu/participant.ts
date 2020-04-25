const fs = require("fs");
import { Room } from "./room";
import {
  MediaServer,
  Recorder,
  IncomingStream,
  OutgoingStream,
  Transport,
} from "medooze-media-server";
import { TypedEvent } from "../common/typedEvent";
import { SDPInfo, StreamInfo } from "semantic-sdp";
import { CONFIG } from "../config/config";

const Medooze: MediaServer = require("medooze-media-server");

export class Participant {
  private name: string;
  private room: Room;
  private transport: Transport;
  private localSDP: SDPInfo;
  private remoteSDP: SDPInfo;
  private incomingStreams: Map<string, IncomingStream>;
  private outgoingStreams: Map<string, OutgoingStream>;
  private isStopped = false;
  private recorder: Recorder;

  streamEmitter = new TypedEvent<IncomingStream>();
  reNegotiationEmitter = new TypedEvent<SDPInfo>();
  stoppedEmitter = new TypedEvent();

  getName = () => this.name;
  getRemoteSDP = () => this.remoteSDP;
  getLocalSDP = () => this.localSDP;
  getIncomingStreams = () => this.incomingStreams.values();

  constructor(name: string, room: Room) {
    this.name = name;
    this.room = room;

    this.incomingStreams = new Map<string, IncomingStream>();
    this.outgoingStreams = new Map<string, OutgoingStream>();
  }

  init = (sdp: SDPInfo) => {
    const endpoint = this.room.getEndpoint();

    this.transport = endpoint.createTransport(sdp);
    this.transport.setRemoteProperties(sdp);

    const answer = sdp.answer({
      dtls: this.transport.getLocalDTLSInfo(),
      ice: this.transport.getLocalICEInfo(),
      candidates: endpoint.getLocalCandidates(),
      capabilities: this.room.getCapabilities(),
    });

    this.transport.setLocalProperties({
      audio: sdp.getMedia("audio"),
      video: sdp.getMedia("video"),
    });

    this.localSDP = answer;
    this.remoteSDP = sdp;
  };

  addStream = (stream: IncomingStream) => {
    const outgoingStream = this.transport.createOutgoingStream({
      video: true,
      audio: true,
    });

    const info = outgoingStream.getStreamInfo();
    this.localSDP.addStream(info);

    this.outgoingStreams.set(outgoingStream.getId(), outgoingStream);

    this.reNegotiationEmitter.emit(this.localSDP);

    outgoingStream.attachTo(stream);

    stream.on("stopped", () => {
      if (!this.outgoingStreams) {
        return;
      }

      this.outgoingStreams.delete(outgoingStream.getId());
      this.localSDP.removeStream(info);
      this.reNegotiationEmitter.emit(this.localSDP);

      outgoingStream.stop();
    });
  };

  publishStream = (stream: StreamInfo) => {
    if (!this.transport) throw Error("Not inited");

    const incomingStream = this.transport.createIncomingStream(stream);

    if (CONFIG.sfu.enable_record) {
      const recordFolder = `/tmp/${this.room.getId()}`;
      fs.mkdir(recordFolder, { recursive: true }, () => {
        const currentUnixtime = new Date().getTime();
        const recordFilePath = `${recordFolder}/${this.name}-${currentUnixtime}.mp4`;

        this.recorder = Medooze.createRecorder(recordFilePath);
        this.recorder.record(incomingStream);
      });
    }

    this.incomingStreams.set(incomingStream.getId(), incomingStream);
    this.streamEmitter.emit(incomingStream);

    let videoTrack = incomingStream.getVideoTracks()[0];
    if (CONFIG.sfu.check_media_stream_alive) {
      if (videoTrack) {
        let totalReceivedVideoBytes: number = 0;
        let observeBytes = setInterval(() => {
          let stats = videoTrack.getStats()[""];
          let media = stats["media"];

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

    if (this.recorder) {
      this.recorder.stop();
    }

    //Clean them
    this.room = null;
    this.incomingStreams = null;
    this.outgoingStreams = null;
    this.transport = null;
    this.recorder = null;
    this.localSDP = null;
    this.remoteSDP = null;
    this.isStopped = true;

    //Done
    this.stoppedEmitter.emit(null);
  }
}
