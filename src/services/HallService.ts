import { Driver } from "tgrid/components/Driver";
import { DomainError } from "tstl/exception/LogicError";

import { IAwaitor } from "../controllers/IAwaitor";
import { IHall } from "../controllers/IHall";
import { IGame } from "../features/IGame";
import { Role } from "../features/Role";

import { ServerAgent } from "./ServerAgent";
import { UserAgent } from "./UserAgent";
import { Game } from "./Game";

export class HallService implements IHall
{
    private server_: ServerAgent;
    private user_: UserAgent | null;
    public readonly awaitor_: Driver<IAwaitor>;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    public constructor(server: ServerAgent, awaitor: Driver<IAwaitor>)
    {
        this.server_ = server;
        this.awaitor_ = awaitor;
        this.user_ = null;
    }

    public async destructor(): Promise<void>
    {
        
    }

    public setName(val: string): IGame[] | false
    {
        if (this.server_.users_.has(val) === true)
            return false;

        this.user_ = new UserAgent(val);

        this.server_.users_.emplace(val, this.user_);
        this.server_.halls_.insert(this);

        return [...this.server_.games_].map(it => it.second.toJSON());
    }

    public createGame(size: number): number
    {
        if (size <= 0 || Math.floor(size) !== size || size % 2 === 1)
            throw new DomainError("Size must be even number.");

        let game: Game = new Game(size);
        this.server_.games_.emplace(game.uid_, game);

        return game.uid_;
    }

    public participatable(uid: number, role: Role): string | null
    {
        if (this.user_ === null)
            return "Set your name first.";
        else if (this.server_.games_.has(uid) === false)
            return `Unable to find the matched game uid: ${uid}.`;

        let game: Game = this.server_.games_.get(uid);
1
        if (game.players_.has(this.user_) || game.observers_.has(this.user_))
            return "You are already participating in the game.";
        else if (role === Role.PLAYER && game.winner_ !== undefined)
            return "The game has been finished.";
        else if (role === Role.PLAYER && game.players_.size() === 2)
            return "Players in the game are full.";

        return null;
    }
}
