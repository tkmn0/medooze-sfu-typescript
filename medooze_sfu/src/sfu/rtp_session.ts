export class RTPSession {

    private session;
    private type: string;;
    private track;
    private port: number;
    
    constructor(session, type, track, port) {
        this.session = session;
        this.type = type;
        this.track = track;
        this.port = port;
    }

    getPort() {
        return this.port;
    }

    startSession() {
        this.session.getOutgoingStreamTrack().attachTo(this.track);
    }

    stopSession() {
        this.session.getOutgoingStreamTrack().detach();
    }
}