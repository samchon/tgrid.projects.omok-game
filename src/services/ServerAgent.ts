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
import { IAwaitor } from "../controllers/IAwaitor";
import { Role } from "../features/Role";
import { IObserver } from "../controllers/IObserver";
import { IPlayer } from "../controllers/IPlayer";

export class ServerAgent
{
    private protocol_: WebServer<HallService | PlayerService | ObserverService>;

    public readonly halls_: HashSet<HallService>;
    public readonly users_: HashMap<string, UserAgent>;
    public readonly games_: HashMap<number, Game>;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    public constructor()
    {
        this.protocol_ = new WebServer();

        this.halls_ = new HashSet();
        this.users_ = new HashMap();
        this.games_ = new HashMap();
    }

    public open(port: number): Promise<void>
    {
        return this.protocol_.open(port, async acceptor =>
        {
            if (acceptor.path === "/")
                await this._Accept_hall(acceptor as WebAcceptor<HallService>);
            else if (acceptor.path.indexOf("/players") === 0)
                await this._Accept_player(acceptor as WebAcceptor<PlayerService>);
            else if (acceptor.path.indexOf("/observers") === 0)
                await this._Accept_observer(acceptor as WebAcceptor<ObserverService>);
            else
                await acceptor.reject(404, "Page not found.");
        });
    }

    public close(): Promise<void>
    {
        return this.protocol_.close();
    }

    /* ----------------------------------------------------------------
        ACCEPTORS
    ---------------------------------------------------------------- */
    private async _Accept_hall(acceptor: WebAcceptor<HallService>): Promise<void>
    {
        let awaitor: Driver<IAwaitor> = acceptor.getDriver();
        let service: HallService = new HallService(this, awaitor);

        await acceptor.accept(service);
        await acceptor.join();
        await service.destructor();
    }

    private async _Accept_player(acceptor: WebAcceptor<PlayerService>): Promise<void>
    {
        let req: IPlayer.IRequest = URLVariables.parse(acceptor.path);
        let error: WebError | null = this._Validate_observer(req);

        let game: Game = this.games_.get(req.gid);
        let user: UserAgent = this.users_.get(req.name);

        if (typeof req.color !== "number")
            error = new WebError(400, "Invalid parameter.");
        else if (req.role === Role.PLAYER && game.winner_ !== null)
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

        let player: Driver<IPlayer> = acceptor.getDriver();
        let service: PlayerService = new PlayerService(user, game, req.color, player);

        game.players_.emplace(user, service);
        await acceptor.accept(service);
        await service.destructor();
    }

    private async _Accept_observer(acceptor: WebAcceptor<ObserverService>): Promise<void>
    {
        let req: IObserver.IRequest = URLVariables.parse(acceptor.path);
        let error: WebError | null = this._Validate_observer(req);

        if (error !== null)
        {
            await acceptor.reject(error.code().value(), error.message);
            return;
        }
        
        let game: Game = this.games_.get(req.gid);
        let user: UserAgent = this.users_.get(req.name);
        let observer: Driver<IObserver> = acceptor.getDriver();
        let service: ObserverService = new ObserverService(user, game, observer);

        game.observers_.emplace(user, service);
        await acceptor.accept(service);
        await service.destructor();
    }

    private _Validate_observer(req: IObserver.IRequest): WebError | null
    {
        if (typeof req.gid !== "number" || typeof req.pid !== "number" || typeof req.name !== "string" || typeof req.role !== "number")
            return new WebError(400, "Invalid parameter");
        else if (this.games_.has(req.gid) === false)
            return new WebError(404, "Unable to find the matched game.");
        else if (this.users_.has(req.name) === false)
            return new WebError(401, "Invalid authorization.");

        let user: UserAgent = this.users_.get(req.name);
        return (user.uid !== req.pid)
            ? new WebError(401, "Invalid authorization.")
            : null;
    }
}