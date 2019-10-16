import { HashMap } from "tstl/container/HashMap";

import { IGame } from "../features/IGame";
import { Color } from "../features/Color";

import { ServerAgent } from "./ServerAgent";
import { UserAgent } from "./UserAgent";
import { PlayerService } from "./PlayerService";
import { ObserverService } from "./ObserverService";
import { Board } from "../features/Board";
import { Global } from "../Global";

export class Game
{
    public readonly uid: number;

    public readonly server_: ServerAgent;
    public readonly players_: HashMap<UserAgent, PlayerService>;
    public readonly observers_: HashMap<UserAgent, ObserverService>;
    
    private board_: Board;
    public readonly winner?: Color | null;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    public constructor(server: ServerAgent, size: number)
    {
        this.uid = Global.increment();

        this.server_ = server;
        this.players_ = new HashMap();
        this.observers_ = new HashMap();

        this.board_ = new Board(size);
        this.winner = null;
    }

    public toJSON(): IGame
    {
        return {
            uid: this.uid,
            size: this.board_.size(),
            players: [...this.players_].map(it => it.first.name),
            observers: [...this.observers_].map(it => it.first.name),
            winner: this.winner
        };
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
                let p = it.second.participant_.printTalk(from, content);
                p.catch(() => {});
            }
    }

    /* ----------------------------------------------------------------
        PARTICIPANTS I/O
    ---------------------------------------------------------------- */
    public participate(service: ObserverService | PlayerService): void
    {
        this._Get_dictionary(service).emplace(service.user_, service);
        this._Handle_participant();
    }

    public unlink(service: ObserverService | PlayerService): void
    {
        this._Get_dictionary(service).erase(service.user_);
        
        // INFORM
        if (this.players_.empty() && this.observers_.empty())
            for (let hall of this.server_.halls)
            {
                let p = hall.awaitor_.erase(this.uid);
                p.catch(() => {});
            }
        else
        {
            this._Handle_participant();
        }
    }

    private _Get_dictionary(service: ObserverService | PlayerService): HashMap<UserAgent, ObserverService>
    {
        return service instanceof PlayerService 
            ? this.players_ 
            : this.observers_;
    }

    private _Handle_participant(): void
    {
        let raw: IGame = this.toJSON();

        // INFORM TO PARTICIPANTS
        for (let participants of [this.players_, this.observers_])
            for (let it of participants)
            {
                let p = it.second.participant_.assign(raw);
                p.catch(() => {});
            }

        // INFORM TO HALL
        for (let hall of this.server_.halls)
        {
            let p = hall.awaitor_.update(this.uid, raw);
            p.catch(() => {});
        }
    }

    /* ----------------------------------------------------------------
        JUDGEMENTS
    ---------------------------------------------------------------- */
}