export class SignalingMessage {

    type: string;
    sdp: string;
    roomName: string;
    userName: string;

    constructor(msg: { type: string, sdp: string, roomName: string, userName: string }) {
        this.type = msg.type;
        this.sdp = msg.sdp;
        this.roomName = msg.roomName;
        this.userName = msg.userName;
    }
}