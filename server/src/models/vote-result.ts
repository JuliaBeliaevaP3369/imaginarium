import {Gamer} from "./gamer";

export interface VoteResult {
    card: string;
    author: Gamer;
    selections: Gamer[];
}
