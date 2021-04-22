import WebSocket from 'ws';
import {Game} from "../core/game";
import {ExecutionRequest} from "../models/execution-request";
import {Gamer} from "../models/gamer";
import {VoteResult} from "../models/vote-result";
import {Association} from "../models/association";
import {Connection} from "./connection";
import {GAME_STATE} from "../models/game-state";


export class Controller {
    private static allowedMethods = [
        'setAssociation',
        'setTableCard',
        'vote',
        'setReadyForNextRound'
    ]

    private gameInProgress = false;

    private connections: Connection[] = [];

    private game: Game;

    public readyNumber = 0;

    public newConnection(connection: Connection) {
        if (this.gameInProgress || this.connections.map(con => con.user).includes(connection.user)) {
            connection.close(1000, "Game already in progress or such user already exists.");
            return;
        }
        this.incrementReadyNumber();
        this.connections.push(connection);
        connection.onClose(this.reset)
        if (this.connections.length === Game.UsersNumber) {
            this.gameInProgress = true;
            this.game = new Game(this.connections.map(elem => elem.user), this);
            this.game.setCards();
        }
    }

    public executeMethod(msg: ExecutionRequest) {
        if (!Controller.allowedMethods.includes(msg.method)) {
            return;
        }
        this.incrementReadyNumber();
        // @ts-ignore
        this.game[msg.method](...[msg.user].concat(msg.parameters));
    }

    public onCardsSet = (gamers: Gamer[]) => {
        gamers.forEach(gamer => {
            const connection = this.getUserConnection(gamer.id);
            connection.send({ state: GAME_STATE.ASSOCIATION_CREATION, payload: {
                gamer,
                cardsLeft: Game.CardsNumber - Game.UsersNumber * 6,
                leading: this.game.leading,
                points: this.game.getCurrentPoints()
            } });
        });
    }

    public onAssociationSet = (association: Association) => {
        this.connections.forEach(connection => {
            connection.send({ state: GAME_STATE.CARDS_SELECTION, payload: {
                association: {
                    text: association.text,
                    card: connection.user === this.game.leading ? association.card : undefined
                }
            }})
        })
    }

    public onTableCardsSet = (cards: string[]) => {
        const shuffled = cards.sort(() => Math.random() - 0.5);
        this.connections.forEach(connection => {
            connection.send({ state: GAME_STATE.VOTING, payload: { cards: shuffled } });
        });
        this.incrementReadyNumber();
    }

    public onVoteEnd = (voteResults: VoteResult[], roundResults: { user: string; points: number }[]) => {
        const vote = voteResults.map(elem => ({
            card: elem.card,
            author: elem.author.id,
            selections: elem.selections.map(item => item.id)
        }))
        this.connections.forEach(connection => {
            connection.send({ state: GAME_STATE.NEXT_ROUND_PREPARATION, payload: { vote, roundResults } });
        })
    }

    public onStartNextRound = (gamers: Gamer[], cardsLeft: number) => {
        gamers.forEach(gamer => {
            const connection = this.getUserConnection(gamer.id);
            connection.send({ state: GAME_STATE.ASSOCIATION_CREATION, payload: {
                    gamer,
                    cardsLeft,
                    leading: this.game.leading,
                    points: this.game.getCurrentPoints()
            }});
        })
    }

    public onGameEnd = (results: { user: string; points: number }[]) => {
        this.connections.forEach(connection => {
            connection.send({ state: GAME_STATE.END_OF_GAME, payload: { results } });
        })
    }

    private getUserConnection(user: string) {
        return this.connections.find(elem => elem.user === user);
    }

    private incrementReadyNumber() {
        this.readyNumber = this.readyNumber === Game.UsersNumber - 1 ? 0 : this.readyNumber + 1;
        this.connections.forEach(connection => {
            connection.send({action: 'updateReadyNumber', payload: {
                        readyNumber: this.readyNumber,
                        allNumber: Game.UsersNumber
                    }
            })
        })
    }

    public reset = () => {
        this.game = null;
        this.connections.forEach(con => {
            try {
                con.close(1001, 'User left game');
            } catch (e) {
                console.log(e);
            }
        });
        this.connections = [];
        this.gameInProgress = false;
        this.readyNumber = 0;
    }
}

const controller = new Controller();
export default controller;
