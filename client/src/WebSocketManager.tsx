import React, {Component} from 'react';
import RoutesManager from "./RoutesManager";
import {Game} from "./models/game";
import {GAME_STATE} from "./models/game-state";
import {Association} from "./models/association";
import {serverUrl} from "./config";


interface IState {
    game: Game | null;
    readyUsers: {
        readyNumber: number;
        allNumber: number;
    }
}

interface IProps {
}

interface GameResponse {
    state?: GAME_STATE;
    payload: any;
    action?: string;
}

class WebSocketManager extends Component<IProps, IState> {
    private socket: WebSocket | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            game: null,
            readyUsers: {
                readyNumber: 0,
                allNumber: 5
            }
        }

    }

    onRegister = (name: string) => {
        this.socket = new WebSocket(`ws://${serverUrl}/api?user=${name}`);
        this.socket.onmessage = (e) => this.parseMessage(JSON.parse(e.data));
        this.socket.onclose = this.onClose;
        this.socket.onopen = () => {
            fetch(`http://${serverUrl}/info`)
                .then(res => res.json())
                .then(data => this.setState({
                    readyUsers: data
            }));
        };
    }

    componentDidMount() {
        fetch(`http://${serverUrl}/info`)
            .then(res => res.json())
            .then(data => this.setState({
                readyUsers: data
        }))
    }

    onClose = () => {
        this.setState({
            game: null,
            readyUsers: {
                readyNumber: 0,
                allNumber: 5
            }
        })
    }

    restart = () => {
        this.socket?.close();
        this.onClose();
    }

    parseMessage = (data: GameResponse) => {
        console.log(data);
        if (data.action) {
            this.setState({
                readyUsers: data.payload
            });
            return;
        }

        switch (data.state) {
            case GAME_STATE.ASSOCIATION_CREATION:
                this.setState({
                    game: {
                        points: data.payload.points,
                        gamer: data.payload.gamer,
                        gameState: data.state,
                        leadName: data.payload.leading,
                        cardsLeft: data.payload.cardsLeft,
                        tableCards: undefined,
                        association: undefined,
                        voteResults: undefined,
                        roundResults: undefined

                    }
                })
                break;
            case GAME_STATE.CARDS_SELECTION:
                this.setState((state: IState) => ({
                    game: {
                        ...state.game as Game,
                        gameState: GAME_STATE.CARDS_SELECTION,
                        association: data.payload.association
                    }
                }))
                break;
            case GAME_STATE.VOTING:
                this.setState((state: IState) => ({
                    game: {
                        ...state.game as Game,
                        gameState: GAME_STATE.VOTING,
                        tableCards: data.payload.cards
                    }
                }))
                break;
            case GAME_STATE.NEXT_ROUND_PREPARATION:
                this.setState((state: IState) => ({
                    game: {
                        ...state.game as Game,
                        gameState: GAME_STATE.NEXT_ROUND_PREPARATION,
                        voteResults: data.payload.vote,
                        roundResults: data.payload.roundResults
                    }
                }))
                break;
            case GAME_STATE.END_OF_GAME:
                this.setState((state: IState) => ({
                    game: {
                        ...state.game as Game,
                        gameState: GAME_STATE.END_OF_GAME,
                        gameResult: data.payload.results
                    }
                }))
                break;
        }
    }

    setAssociation = (association: Association) => {
        const message = {
            method: 'setAssociation',
            parameters: [association]
        };
        this.socket?.send(JSON.stringify(message));
    }

    setTableCard = (card: string) => {
        const message = {
            method: 'setTableCard',
            parameters: [card]
        };
        this.socket?.send(JSON.stringify(message));
    }

    vote = (card: string) => {
        const message = {
            method: 'vote',
            parameters: [card]
        };
        this.socket?.send(JSON.stringify(message));
    }

    setReadyForNextRound = () => {
        const message = {
            method: 'setReadyForNextRound',
            parameters: []
        };
        this.socket?.send(JSON.stringify(message));
    }

    render() {
        return (
            <RoutesManager
                onSubmit={this.onRegister}
                game={this.state.game}
                setAssociation={this.setAssociation}
                setTableCard={this.setTableCard}
                vote={this.vote}
                setReadyForNextRound={this.setReadyForNextRound}
                readyUsers={this.state.readyUsers}
                restart={this.restart}
            />
        );
    }
}

export default WebSocketManager;
