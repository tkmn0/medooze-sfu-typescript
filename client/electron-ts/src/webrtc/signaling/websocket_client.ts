
import { SignalingMessage } from "./signaling_message";

export class WebSocketClient {

    private _ws: WebSocket;
    public onMessage: (message: SignalingMessage) => void;

    constructor(url: string) {
        this._ws = this.setup(url);
    }

    private setup = (url: string) => {
        let ws = new WebSocket(url);
        ws.onmessage = (ev) => {
            let message: SignalingMessage = JSON.parse(ev.data.toString());
            if (this.onMessage != null) {
                this.onMessage(message);
            }
        };
        return ws;
    }

    public sendMesage = (message: SignalingMessage) => {
        if (this._ws.readyState == WebSocket.OPEN) {
            this._ws.send(JSON.stringify(message));
        } else {
            console.error("websocket not ready");
        }
    };
}