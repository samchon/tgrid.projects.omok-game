import { WebServer } from "tgrid/protocols/web/WebServer";
import { WebAcceptor } from "tgrid/protocols/web/WebAcceptor";
import { Driver } from "tgrid/components/Driver";

import { HashMap } from "tstl/container/HashMap";
import { HashSet } from "tstl/container/HashSet";
import { URLVariables } from "tgrid/utils/URLVariables";
import { WebError } from "tgrid/protocols/web/WebError";

import { UserAgent } from "./UserAgent";
import { HallService } from "./HallService";
import { Game } from "./Game";
import { PlayerService } from "./PlayerService";
import { ObserverService } from "./ObserverService";
import { Role } from "../features/Role";
import { IObserver } from "../controllers/IObserver";
import { IPlayer } from "../controllers/IPlayer";

export class ServerAgent
{
    private protocol_: WebServer<HallService | PlayerService | ObserverService>;

    public readonly halls: HashSet<HallService>;
    public readonly users: HashMap<string, UserAgent>;
    public readonly games: HashMap<number, Game>;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    public constructor()
    {
        this.protocol_ = new WebServer();

        this.halls = new HashSet();
        this.users = new HashMap();
        this.games = new HashMap();
    }

    public async open(port: number): Promise<void>
    {
        await this.protocol_.open(port, async acceptor =>
        {
            if (acceptor.path === "/")
                await this._Accept_awaitor(acceptor as WebAcceptor<HallService>);
            else if (acceptor.path.indexOf("/players") === 0)
                await this._Accept_player(acceptor as WebAcceptor<PlayerService>);
            else if (acceptor.path.indexOf("/observers") === 0)
                await this._Accept_observer(acceptor as WebAcceptor<ObserverService>);
            else
                await acceptor.reject(404, "Page not found.");
        });

        for (let i: number = 0; i < 4; ++i)
        {
            let game: Game = new Game(this, 8);
            this.games.emplace(game.uid, game);
        }
    }

    public close(): Promise<void>
    {
        return this.protocol_.close();
    }

    /* ----------------------------------------------------------------
        ACCEPTORS
    ---------------------------------------------------------------- */
    private async _Accept_awaitor(acceptor: WebAcceptor<HallService>): Promise<void>
    {
        // INITIALIZE SERVICE
        let service: HallService = await HallService.initialize(this, acceptor);

        // SERVICE LIST I/O
        this.halls.insert(service);
        await acceptor.join();

        this.halls.erase(service);
        service.destructor();
    }

    private async _Accept_player(acceptor: WebAcceptor<PlayerService>): Promise<void>
    {
        // PREPARE REQUEST
        let req: IPlayer.IRequest = URLVariables.parse(acceptor.path);
        let error: WebError | null = this._Validate_observer(req);

        let game: Game = this.games.get(req.gid);
        let user: UserAgent = this.users.get(req.name);

        if (typeof req.color !== "number")
            error = new WebError(400, "Invalid parameter.");
        else if (req.role === Role.PLAYER && game.winner !== null)
            error = new WebError(403, "The game is already over.");
        else if (req.role === Role.PLAYER && game.players_.size() === 2)
            error = new WebError(403, "Players are already full.");
        else if (game.observers_.has(user) || game.players_.has(user))
            error = new WebError(403, "You are already parcipating in the game.");

        if (error !== null)
        {
            await acceptor.reject(error.code().value(), error.message);
            return;
        }

        // INITIALIZE SERVICE
        let player: Driver<IPlayer> = acceptor.getDriver();
        let service: PlayerService = new PlayerService(user, game, req.color, player);

        game.players_.emplace(user, service);
        await acceptor.accept(service);

        await acceptor.join();
    }

    private async _Accept_observer(acceptor: WebAcceptor<ObserverService>): Promise<void>
    {
        // PARSE REQUEST
        let req: IObserver.IRequest = URLVariables.parse(acceptor.path);
        let error: WebError | null = this._Validate_observer(req);

        if (error !== null)
        {
            await acceptor.reject(error.code().value(), error.message);
            return;
        }
        
        // INITIALIZE SERVICE
        let game: Game = this.games.get(req.gid);
        let user: UserAgent = this.users.get(req.name);
        let service: ObserverService = await ObserverService.initialize(user, game, acceptor);

        // SERVICE LIST I/O
        game.observers_.emplace(user, service);
        await acceptor.join();

        game.observers_.erase(user);
        service.destructor();
    }

    private _Validate_observer(req: IObserver.IRequest): WebError | null
    {
        if (typeof req.gid !== "number" || typeof req.pid !== "number" || typeof req.name !== "string" || typeof req.role !== "number")
            return new WebError(400, "Invalid parameter");
        else if (this.games.has(req.gid) === false)
            return new WebError(404, "Unable to find the matched game.");
        else if (this.users.has(req.name) === false)
            return new WebError(401, "Invalid authorization.");

        let user: UserAgent = this.users.get(req.name);
        return (user.uid !== req.pid)
            ? new WebError(401, "Invalid authorization.")
            : null;
    }
}