import React, {Component} from 'react';
import './RoundResults.scss';
import {Redirect} from "react-router-dom";
import {GAME_STATE} from "../../models/game-state";

interface IProps {
    readyUsers:  {
        readyNumber: number;
        allNumber: number;
    };
    gameState: GAME_STATE | undefined;
    roundResults: { user: string; points: number }[] | undefined;
    gamerName: string | undefined;
    onReadyClick: () => void;
}

interface IState {
    buttonClicked: boolean;
}

class RoundResults extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            buttonClicked: false
        };
    }

    onReadyClick = () => {
        if (!this.state.buttonClicked) {
            this.setState({
                buttonClicked: true
            });
        }
        this.props.onReadyClick();
    }

    render() {
        if (this.props.gameState === GAME_STATE.END_OF_GAME) {
            return <Redirect to="/game-results" />
        }
        if (!this.props.roundResults) {
            return <Redirect to="/game" />
        }

        const results = this.props.roundResults?.concat() || [];
        const gamerIndex = results.findIndex(res => res.user === this.props.gamerName);
        results.unshift(...results.splice(gamerIndex, 1));

        const ready = this.props.readyUsers;
        return (
            <div className="round-results">
                <div className="container">
                    <main>
                        <h1>Очки за раунд</h1>
                        <dl>
                            {
                                results.map(res =>
                                    <dt>
                                        <div className="line">
                                            <div className="free_space"/>
                                            <div className="name"><span>{res.user}</span></div>
                                            <div className="score"><span>+{res.points}</span></div>
                                        </div>
                                    </dt>
                                )
                            }
                        </dl>
                        <div className="ready">Готовы: <span>{ready.readyNumber}</span> / {ready.allNumber}</div>
                        <button
                            onClick={this.onReadyClick}
                            disabled={this.state.buttonClicked}
                            className="box_bottom"
                        >
                            Продолжить
                        </button>
                    </main>
                </div>
            </div>
        );
    }
}

export default RoundResults;
