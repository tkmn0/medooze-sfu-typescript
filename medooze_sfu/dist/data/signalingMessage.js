"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SignalingMessage {
    constructor(msg) {
        this.type = msg.type;
        this.sdp = msg.sdp;
        this.roomName = msg.roomName;
        this.userName = msg.userName;
    }
}
exports.SignalingMessage = SignalingMessage;
//# sourceMappingURL=signalingMessage.js.map