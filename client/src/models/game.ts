import {Gamer} from "./gamer";
import {GAME_STATE} from "./game-state";
import {vote} from "./vote";

export interface Game {
    points: { user: string; points: number }[];
    gamer: Gamer;
    leadName: string
    gameState: GAME_STATE;
    cardsLeft: number;
    association?: {
        card?: string;
        text: string;
    }
    tableCards?: string[];
    roundResults?: { user: string; points: number }[];
    voteResults?: vote[];
    gameResult?: { user: string; points: number }[];
}
