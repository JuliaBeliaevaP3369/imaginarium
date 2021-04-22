import {GAME_STATE} from "../models/game-state";
import WebSocket from "ws";

interface GameResponse {
    state?: GAME_STATE;
    payload: any;
    action?: string;
}

export class Connection {
    constructor(private ws: WebSocket, public user: string) {
    }

    public send(msg: GameResponse) {
        this.ws.send(JSON.stringify(msg));
    }

    public close(code: number, msg: string) {
        this.ws.close(code, msg);
    }

    public onClose(callback: () => void) {
        this.ws.on('close', callback);
    }
}
