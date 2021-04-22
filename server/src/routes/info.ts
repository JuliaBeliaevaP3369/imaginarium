import {Application} from "express";
import controller from "../controllers/controller";
import {Game} from "../core/game";

export default function (app: Application){
    app.get('/info', (req, res) => {
        const readyNumber = controller.readyNumber;
        res.send(JSON.stringify({
            readyNumber: readyNumber,
            allNumber: Game.UsersNumber
        }));
    });

    app.get('/reset', (req, res) => {
        controller.reset();
        res.send('OK');
    })
}
