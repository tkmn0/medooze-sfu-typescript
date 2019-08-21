import { SignalingDelegate } from "./signalingDelegate";
import { SignalingMessage } from "../data/signalingMessage";

export interface ISignalingServer {
    signalingDelegate: SignalingDelegate;
    updateSDP(message: SignalingMessage): void
}