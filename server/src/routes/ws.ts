import {Application} from "express-ws";
import controller from "../controllers/controller";
import {ExecutionRequest} from "../models/execution-request";
import {Connection} from "../controllers/connection";

export default function(app: Application) {
    app.ws('/api',  (ws, req) => {
        controller.newConnection(new Connection(ws, req.query.user as string));
        ws.on('message', (msg: string) => {
            const request: ExecutionRequest = JSON.parse(msg);
            request.user = req.query.user as string;
            controller.executeMethod(request);
        })
    })
}
