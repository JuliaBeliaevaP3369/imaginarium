import React, {Component} from 'react';
import './Main.scss';
import {Game} from "../../models/game";
import {GAME_STATE} from "../../models/game-state";
import {serverUrl} from "../../config";
import cn from 'classnames';
import {Association} from "../../models/association";
import {Link, Redirect} from "react-router-dom";

const TOOLTIP = {
    [GAME_STATE.ASSOCIATION_CREATION]: [
        "Ждать, пока ведущий напишет ассоциацию",
        "Ты - ведущий! Выбери 1 из своих карт и пиши ассоциацию"
    ],
    [GAME_STATE.CARDS_SELECTION]: [
        "Выбирай из своих карт 1 подходящую под ассоциацию",
        "Ждать, пока участники выбирают карты"
    ],
    [GAME_STATE.VOTING]: [
        "Угадывай карту ведущего и глосуй за нее",
        "Ждать, пока участники голосуют"
    ],
    [GAME_STATE.NEXT_ROUND_PREPARATION]: [
        "Смотреть результаты голосования",
        "Смотреть результаты голосования"
    ],
    [GAME_STATE.END_OF_GAME]: [
        "Смотреть результаты игры",
        "Смотреть результаты игры"
    ],
}

interface IProps {
    game: Game;
    readyUsers:  {
        readyNumber: number;
        allNumber: number;
    };
    setAssociation: (association: Association) => void;
    setTableCard: (card: string) => void;
    vote: (card: string) => void;
    setReadyForNextRound: () => void;
}

interface IState {
    chosenCard: string;
    canChoseCard: boolean;
    associationWasSet: boolean;
    associationText: string;
    votedCard: string;
    canVoteCard: boolean;
}

class Main extends Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            chosenCard: '',
            canChoseCard: false,
            associationWasSet: false,
            associationText: '',
            votedCard: '',
            canVoteCard: false
        }
    }

    componentDidUpdate() {
        const game = this.props.game;
        if (!game) {
            return;
        }
        if (!this.state.chosenCard && !this.state.canChoseCard  && (
                (game.gameState === GAME_STATE.ASSOCIATION_CREATION && game.gamer.isLead) ||
                (game.gameState === GAME_STATE.CARDS_SELECTION)
            )
        ) {
            this.setState({
                canChoseCard: true
            })
        }

        if (!this.state.votedCard && !this.state.canVoteCard && game.gameState === GAME_STATE.VOTING && !game.gamer.isLead) {
            this.setState({
                canVoteCard: true
            })
        }
    }

    componentDidMount() {
        const game = this.props.game;
        if (!game) {
            return;
        }
        if (!this.state.chosenCard  && (
            (game.gameState === GAME_STATE.ASSOCIATION_CREATION && game.gamer.isLead) ||
            (game.gameState === GAME_STATE.CARDS_SELECTION)
        )
        ) {
            this.setState({
                canChoseCard: true
            })
        }
    }

    choseCard = (card: string) => {
        if (this.state.canChoseCard) {
            this.setState({
                chosenCard: card,
                canChoseCard: false
            });
            if (this.props.game.gameState === GAME_STATE.CARDS_SELECTION && !this.props.game.gamer.isLead) {
                this.props.setTableCard(card);
            }
        }
    }

    voteForCard = (card: string) => {
        if (this.state.canVoteCard  && this.state.chosenCard !== card) {
            this.setState({
                votedCard: card,
                canVoteCard: false
            });
            this.props.vote(card);
        }
    }

    associationReadyClick = () => {
        this.props.setAssociation({card: this.state.chosenCard, text: this.state.associationText});
        this.setState({
            associationWasSet: true
        })
    }

    render() {
        if (!this.props.game) {
            return <Redirect to='/preparation' />
        }
        if (this.props.game.gameState === GAME_STATE.END_OF_GAME) {
            return <Redirect to='/game-results' />
        }

        const gamer = this.props.game.gamer;
        const tableCards = this.props.game.tableCards || Array(5).fill('');
        const ready = this.props.readyUsers;
        return (
            <div className="main">
                <div className="my_grid">
                    <div className="box1">
                        <dl>
                            <dt>
                                <div className="line">
                                    <div className="leader">Ведущий:</div>
                                </div>
                            </dt>
                            <dt>
                                <div className="line">
                                    <div className="leader_name"><span>{this.props.game.leadName}</span></div>
                                </div>
                            </dt>
                        </dl>
                        <dl>
                            <dt>
                                <div className="line">
                                    <div className="assotiation">Ассоциация</div>
                                    <div className="info1">
                                        <div className="box">
                                        {
                                            this.props.game.gameState === GAME_STATE.ASSOCIATION_CREATION ?
                                                gamer.isLead ?
                                                    <input
                                                        className="association-input"
                                                        type="text"
                                                        placeholder="Ваша ассоциация..."
                                                        value={this.state.associationText}
                                                        onChange={event => this.setState({associationText: event.target.value})}
                                                    /> :
                                                    <span>...</span>
                                                :
                                            <span>{this.props.game.association?.text}</span>
                                        }
                                        </div>
                                    </div>
                                    <div className="ready">
                                        <div className="btn">
                                            <button
                                                disabled={!(this.state.chosenCard &&
                                                this.props.game.gameState === GAME_STATE.ASSOCIATION_CREATION &&
                                                this.props.game.gamer.isLead &&
                                                !this.state.associationWasSet &&
                                                this.state.associationText) as boolean}
                                                onClick={this.associationReadyClick}>Готово</button>
                                        </div>
                                    </div>
                                </div>
                            </dt>
                            <dt>
                                <div className="line">
                                    <div className="to_do"><span>Что делать:</span></div>
                                    <div className="info2">
                                        <span>{TOOLTIP[this.props.game.gameState][+gamer.isLead]}</span></div>
                                        <div className={cn("info3", {
                                                'info3_hidden': this.props.game.gameState === GAME_STATE.ASSOCIATION_CREATION ||
                                                    this.props.game.gameState === GAME_STATE.NEXT_ROUND_PREPARATION
                                            })}
                                        >
                                            <b>Выбрали: </b><span>{ready.readyNumber}</span>/{ready.allNumber}
                                        </div>
                                </div>
                            </dt>
                        </dl>
                        {
                            this.props.game.gameState === GAME_STATE.NEXT_ROUND_PREPARATION ?
                                <Link to="/round-results">
                                    <button className="next-page-button">Результаты раунда</button>
                                </Link> :
                                <dl className="users-points">
                                    {
                                        this.props.game.points.map(elem =>
                                            <dt className="line">
                                                <div className="free_space"/>
                                                <div className="name"><span>{elem.user}</span></div>
                                                <div className="score"><span>{elem.points}</span></div>
                                            </dt>
                                        )
                                    }
                                </dl>
                        }
                    </div>
                    <div className="box2">
                        <div className="deck"><p>В колоде:<br/><span className="num">{this.props.game.cardsLeft}</span></p></div>
                        {
                            tableCards.map(card =>
                                card ?
                                    <div
                                        className={cn("card2__background", { "card2__background_chose-available": this.state.canVoteCard && this.state.chosenCard !== card })}
                                        onClick={() => this.voteForCard(card)}
                                    >
                                        <img className={cn("card2",
                                            {"card2_chosen": card === this.state.votedCard, "card2_chose-available": this.state.canVoteCard  && this.state.chosenCard !== card })
                                        }
                                             src={`http://${serverUrl}/img/${card}.jpg`}
                                        />
                                        {
                                            this.state.canVoteCard && this.state.chosenCard !== card &&
                                            <span className="card-text">Выбрать</span>
                                        }
                                        {
                                            this.props.game.voteResults &&
                                            <div className="vote-results">
                                                <span>
                                                    {this.props.game.voteResults.find(elem => elem.card === card)?.author}
                                                </span>
                                                {
                                                    this.props.game.leadName === this.props.game.voteResults.find(elem => elem.card === card)?.author
                                                        && <div className="vote-results__lead">Ведущий!</div>
                                                }
                                                <div className="vote-results__selections">
                                                    <div>Выбрали:</div>
                                                    {
                                                        this.props.game.voteResults.find(elem => elem.card === card)
                                                            ?.selections?.map(user =>
                                                            <div>{user}</div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        }
                                    </div> :
                                    <div className="card" />
                            )
                        }
                    </div>
                    <div className="box3">
                        {
                            gamer.cards.map(card =>
                                <div
                                    className={cn("card2__background", { "card2__background_chose-available": this.state.canChoseCard })}
                                    onClick={() => this.choseCard(card)}
                                >
                                    <img className={cn("card2",
                                            {"card2_chosen": card === this.state.chosenCard, "card2_chose-available": this.state.canChoseCard })
                                        }
                                         src={`http://${serverUrl}/img/${card}.jpg`}
                                    />
                                    {
                                        this.state.canChoseCard &&
                                            <span className="card-text">Выбрать</span>
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Main;
