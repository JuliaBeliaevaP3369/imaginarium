import React, {Component} from 'react';
import './GameResults.scss';
import {Redirect} from "react-router-dom";

interface IProps {
    gameResults: { user: string; points: number }[] | undefined;
    gamerName: string | undefined;
    restart : () => void;
}

interface IState {
    redirect: boolean;
}

class GameResults extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            redirect: false
        }
    }


    onButtonClick =() => {
        this.props.restart();
        this.setState({
            redirect: true
        })

    }

    render() {
        if (this.state.redirect) {
            return <Redirect to='/preparation' />
        }
        let isWinner = false;
        const results = this.props.gameResults?.concat().sort((a, b) => b.points - a.points);
        if (results?.[0]?.user === this.props.gamerName) {
            isWinner = true;
        }
        return (
            <div className="game-results">
                <div className="container">
                    <main>
                    <p className="first_text">{isWinner ? `Ура, ${this.props.gamerName}!` :`Упс, ${this.props.gamerName}!`}</p>
                    <h1>{isWinner ? 'Ты выиграл!' : 'Ты проиграл...'}</h1>
                    <dl className="table">
                        {
                            results?.map(result =>
                                <dt>
                                    <div className="line">
                                        <div className="free_space" />
                                        <div className="name"><span>{result.user}</span></div>
                                        <div className="score"><span>+{result.points}</span></div>
                                    </div>
                                </dt>
                            )
                        }
                    </dl>
                    <button onClick={this.onButtonClick} className="box_bottom">Начать новую игру</button>
                    </main>
                </div>
            </div>
        );
    }
}

export default GameResults;
