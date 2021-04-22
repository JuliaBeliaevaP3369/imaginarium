import React, {Component} from 'react';
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {GameResults, Main, Preparation, RoundResults} from "./parges";
import {Game} from "./models/game";
import {Association} from "./models/association";

interface IState {
}

interface IProps {
    game: Game | null;
    readyUsers:  {
        readyNumber: number;
        allNumber: number;
    };
    onSubmit: (name: string) => void;
    setAssociation: (association: Association) => void;
    setTableCard: (card: string) => void;
    vote: (card: string) => void;
    setReadyForNextRound: () => void;
    restart : () => void;
}


class RoutesManager extends Component<IProps, IState> {
    render() {
        // @ts-ignore
        return (
            <BrowserRouter>
                <Switch>
                    <Route path="/preparation">
                        <Preparation onSubmit={this.props.onSubmit} isGameStarted={!!this.props.game} readyUsers={this.props.readyUsers}/>
                    </Route>
                    <Route path="/game">
                        <Main
                            game={this.props.game as Game}
                            readyUsers={this.props.readyUsers}
                            setAssociation={this.props.setAssociation}
                            setTableCard={this.props.setTableCard}
                            vote={this.props.vote}
                            setReadyForNextRound={this.props.setReadyForNextRound}
                        />
                    </Route>
                    <Route path="/round-results">
                        <RoundResults
                            gameState={this.props.game?.gameState}
                            onReadyClick={this.props.setReadyForNextRound}
                            gamerName={this.props.game?.gamer?.id}
                            roundResults={this.props.game?.roundResults}
                            readyUsers={this.props.readyUsers}
                        />
                    </Route>
                    <Route path="/game-results">
                        <GameResults
                            gamerName={this.props.game?.gamer?.id}
                            gameResults={this.props.game?.gameResult}
                            restart={this.props.restart}
                        />
                    </Route>
                    <Redirect to="/preparation" />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default RoutesManager;
