import { HashMap } from "tstl/container/HashMap";

import { IGame } from "../features/IGame";
import { Color } from "../features/Color";

import { UserAgent } from "./UserAgent";
import { PlayerService } from "./PlayerService";
import { ObserverService } from "./ObserverService";
import { Board } from "../features/Board";
import { Global } from "../Global";

export class Game
{
    // MENERS
    public readonly uid_: number;
    public readonly players_: HashMap<UserAgent, PlayerService>;
    public readonly observers_: HashMap<UserAgent, ObserverService>;
    public readonly winner_?: Color | null;

    // THE BOARD
    private board_: Board;

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    public constructor(size: number)
    {
        // ASSIGN MEMBERS
        this.board_ = new Board(size);
        this.players_ = new HashMap();
        this.observers_ = new HashMap();
        
        // PROPERTIES
        this.uid_ = Global.increment();
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    public put(row: number, col: number, color: Color): Board.INext
    {
        return this.board_.put(row, col, color);
    }

    public talk(from: string, content: string): void
    {
        for (let map of [this.players_, this.observers_])
            for (let it of map)
            {
                let p = it.second.observer_.printTalk(from, content);
                p.catch(() => {});
            }
    }

    public toJSON(): IGame
    {
        return {
            uid: this.uid_,
            size: this.board_.size(),
            players: [...this.players_].map(it => it.first.name),
            observers: [...this.observers_].map(it => it.first.name),
            winner: this.winner_
        };
    }

    /* ----------------------------------------------------------------
        JUDGEMENTS
    ---------------------------------------------------------------- */
}