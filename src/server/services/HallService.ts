import { WebAcceptor } from "tgrid/protocols/web/WebAcceptor";
import { Driver } from "tgrid/components/Driver";
import { DomainError } from "tstl/exception/LogicError";

import { IAwaitor } from "../../controllers/IAwaitor";
import { IGame } from "../../features/IGame";
import { IHall } from "../../controllers/IHall";
import { Role } from "../../features/Role";

import { ServerAgent } from "../agents/ServerAgent";
import { UserAgent } from "../agents/UserAgent";
import { GameAgent } from "../agents/GameAgent";

import { Global } from "../../Global";

export class HallService implements IHall
{
    private server_: ServerAgent;
    private user_: UserAgent | null;
    public readonly awaitor_: Driver<IAwaitor>;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    private constructor(server: ServerAgent, awaitor: Driver<IAwaitor>)
    {
        // ASSIGN MEMBERS
        this.server_ = server;
        this.awaitor_ = awaitor;
        this.user_ = null;

    }

    public static async initialize
        (
            server: ServerAgent, 
            acceptor: WebAcceptor<HallService>
        ): Promise<HallService>
    {
        // ACCEPT CONNECTION
        let awaitor: Driver<IAwaitor> = acceptor.getDriver();
        let service: HallService = new HallService(server, awaitor);

        await acceptor.accept(service);
        server.halls.insert(service);

        // DELIVER GAME LIST
        let games: IGame[] = [...server.games].map(it => it.second.toJSON());
        awaitor.assign(games).catch(() => {});

        return service;
    }

    public destructor(): void
    {
        if (this.user_ !== null)
            this.user_.unlink(this);
        this.server_.halls.erase(this);
    }

    /* ----------------------------------------------------------------
        FUNCTIONS FOR REMOTE SYSTEM
    ---------------------------------------------------------------- */
    public setName(val: string): number
    {
        if (this.user_ !== null)
            throw new DomainError("You've already configured your name.");
        else if (this.server_.users.has(val) === true)
            throw new DomainError("Duplicated name exists.");

        this.user_ = new UserAgent(this.server_, this, val);
        this.server_.users.emplace(this.user_.name, this.user_);

        return this.user_.uid;
    }

    public createGame(size: number, title: string): number
    {
        if (this.user_ === null)
            throw new DomainError("Set your name first.");
        else if (size <= 0 || Math.floor(size) !== size || size % 2 === 1)
            throw new DomainError("Size must be even number.");
        else if (this.user_.size() >= Global.LIMIT)
            throw new DomainError(`You can't participate in over ${Global.LIMIT} games.`);

        // EMPLACE GAME
        let game: GameAgent = GameAgent.create(this.server_, size, title);
        return game.uid;
    }

    public participatable(uid: number, role: Role): string | null
    {
        if (this.user_ === null)
            return "Set your name first.";
        else if (this.server_.games.has(uid) === false)
            return `Unable to find the matched game uid: ${uid}.`;

        let game: GameAgent = this.server_.games.get(uid);
1
        if (game.players_.has(this.user_) || game.observers_.has(this.user_))
            return "You are already participating in the game.";
        else if (role === Role.PLAYER && game.winner !== undefined)
            return "The game has been finished.";
        else if (role === Role.PLAYER && game.players_.size() === 2)
            return "Players in the game are full.";

        return null;
    }
}
