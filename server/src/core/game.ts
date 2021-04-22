import {Association} from "../models/association";
import {Gamer} from "../models/gamer";
import {VoteResult} from "../models/vote-result";
import {Controller} from "../controllers/controller";

export class Game {

    static UsersNumber = 5;

    static CardsNumber = 96;

    private association: Association;

    private tableCards: { gamer: Gamer; card: string }[] = [];

    private votes: { gamer: Gamer; card: string }[] = [];

    private readyForNextRound: Set<Gamer> = new Set<Gamer>();

    private cards: string[];

    private readonly gamers: Gamer[];

    public roundPoints: { gamer: Gamer; points: number }[] = [];

    public leading: string;

    constructor(users: string[], private controller: Controller) {
        this.gamers = users.map((id, index) => ({id, isLead: !index, points: 0, cards: []}));
        this.leading = users[0];
        this.cards = Array(Game.CardsNumber)
            .fill(0)
            .map((elem, index) => index.toString())
            .sort(() => Math.random() - 0.5);
    }

    private getGamer(user: string) {
        return this.gamers.find(gamer => gamer.id === user);
    }

    /**
     *  Ведущему по 1 очку за каждого отгадавшего + 2 очка если есть хоть один отгадавший;
     *  Каждому отгодавшему по 2 очка;
     *  Каждому обманувшему по 1 очку за каждый обман;
     */
    private updateStatistics(voteResults: VoteResult[]) {
        const oldPoints = this.gamers.map(gamer => ({gamer, points: gamer.points}));
        voteResults.forEach(voteResult => {
            voteResult.author.points += voteResult.selections.length;
            if (voteResult.author.id === this.leading) {
                voteResult.author.points += voteResult.selections.length ? 2 : 0;
                voteResult.selections.forEach(gamer => gamer.points += 2);
                return;
            }
        });

        const correctAnswersNumber = voteResults.find(res => res.author.id === this.leading).selections.length;
        if (correctAnswersNumber === Game.UsersNumber - 1) {
            this.gamers.find(gamer => gamer.id === this.leading).points -= Game.UsersNumber - 1 + 2;
        }

        this.roundPoints = oldPoints.map(elem => {
            const gamer = this.gamers.find(gamer => gamer.id === elem.gamer.id);
            return {
                gamer,
                points: gamer.points - elem.points
            }
        })
    }

    private startNextRound() {
        if (this.cards.length < Game.UsersNumber) {
            this.endGame();
            return;
        }
        const newLeadingIndex = (this.gamers.findIndex(gamer => gamer.id === this.leading) + 1) % Game.UsersNumber;
        this.leading = this.gamers[newLeadingIndex].id;
        this.gamers.forEach((gamer, index) => {
            gamer.isLead = index === newLeadingIndex
        })
        const usedCards = this.tableCards.map(elem => elem.card);
        this.gamers.forEach(gamer => {
            gamer.cards = gamer.cards.filter(card => !usedCards.includes(card));
            gamer.cards.push(this.cards.shift());
        })
        this.association = null;
        this.tableCards = [];
        this.votes = [];
        this.readyForNextRound = new Set<Gamer>();

        this.controller.onStartNextRound(this.gamers, this.cards.length);
    }

    private endGame() {
        const results = this.gamers.map(gamer => ({user: gamer.id, points: gamer.points}));
        this.controller.onGameEnd(results);
    }

    public setCards() {
        this.gamers.forEach(elem => elem.cards = this.cards.splice(0, 6));
        this.controller.onCardsSet(this.gamers);
    }

    public setAssociation(user: string, association: Association) {
        this.association = association;
        this.tableCards.push({gamer: this.getGamer(this.leading), card: association.card});
        this.controller.onAssociationSet(association);
    }

    public setTableCard(user: string, card: string) {
        this.tableCards.push({ gamer: this.getGamer(user), card});
        if (this.tableCards.length === Game.UsersNumber) {
            this.controller.onTableCardsSet(this.tableCards.map(elem => elem.card));
        }
    }

    public vote(user: string, card: string) {
        this.votes.push({ gamer: this.getGamer(user), card});
        if (this.votes.length === Game.UsersNumber - 1) {
            const voteResults: VoteResult[] = this.tableCards.map(item => ({
                card: item.card,
                author: item.gamer,
                selections: this.votes.filter(elem => elem.card === item.card).map(elem => elem.gamer)
            }));
            this.updateStatistics(voteResults);
            this.controller.onVoteEnd(voteResults, this.roundPoints.map(elem => ({user: elem.gamer.id, points: elem.points})));
        }
    }

    public setReadyForNextRound(user: string) {
        this.readyForNextRound.add(this.gamers.find(gamer => gamer.id === user));
        if (this.readyForNextRound.size === Game.UsersNumber) {
            this.startNextRound();
        }
    }

    public getCurrentPoints(): { user: string; points: number }[] {
        return this.gamers.map(gamer => ({
            user: gamer.id,
            points: gamer.points
        }))
    }
}
