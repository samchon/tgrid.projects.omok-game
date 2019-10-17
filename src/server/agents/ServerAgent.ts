import { WebServer } from "tgrid/protocols/web/WebServer";
import { WebAcceptor } from "tgrid/protocols/web/WebAcceptor";

import { HashMap } from "tstl/container/HashMap";
import { HashSet } from "tstl/container/HashSet";
import { Pair } from "tstl/utility/Pair";
import { URLVariables } from "tgrid/utils/URLVariables";
import { WebError } from "tgrid/protocols/web/WebError";

import { UserAgent } from "./UserAgent";
import { GameAgent } from "./GameAgent";

import { HallService } from "../services/HallService";
import { PlayerService } from "../services/PlayerService";
import { ObserverService } from "../services/ObserverService";
import { IObserverService } from "../../controllers/IObserverService";

export class ServerAgent
{
    private protocol_: WebServer<HallService | PlayerService | ObserverService>;

    public readonly halls: HashSet<HallService>;
    public readonly users: HashMap<string, UserAgent>;
    public readonly games: HashMap<number, GameAgent>;

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
    }

    public async close(): Promise<void>
    {
        await this.protocol_.close();
    }

    /* ----------------------------------------------------------------
        ACCEPTORS
    ---------------------------------------------------------------- */
    private async _Accept_awaitor(acceptor: WebAcceptor<HallService>): Promise<void>
    {
        // INITIALIZE SERVICE
        let service: HallService = await HallService.initialize(this, acceptor);

        // DISCONNECTION
        await acceptor.join();
        service.destructor();
    }

    private async _Accept_player(acceptor: WebAcceptor<PlayerService>): Promise<void>
    {
        // PARSE REQUEST
        let params: Pair<UserAgent, GameAgent> | WebError = this._Parse_request
        (
            acceptor.path,
            ({}: UserAgent, game: GameAgent) =>
            {
                if (game.winner !== null)
                    return new WebError(403, "The game is already over.");
                else if (game.players_.size() === 2)
                    return new WebError(403, "Players are already full.");
                else
                    return null;
            }
        );
        if (params instanceof WebError)
        {
            await acceptor.reject(params.code().value(), params.message);
            return;
        }

        // START SERVICE
        let service: PlayerService = await PlayerService.initialize(params.first, params.second, acceptor);
        {
            await acceptor.join();
            service._Destructor();
        }
    }

    private async _Accept_observer(acceptor: WebAcceptor<ObserverService>): Promise<void>
    {
        // PARSE REQUEST
        let params: Pair<UserAgent, GameAgent> | WebError = this._Parse_request(acceptor.path);
        if (params instanceof WebError)
        {
            await acceptor.reject(params.code().value(), params.message);
            return;
        }

        // START SERVICE
        let service: ObserverService = await ObserverService.initialize(params.first, params.second, acceptor);
        {
            await acceptor.join();
            service._Destructor();
        }
    }

    private _Parse_request
        (
            path: string, 
            addiction?: (user: UserAgent, game: GameAgent) => WebError | null
        ): Pair<UserAgent, GameAgent> | WebError
    {
        let params: IObserverService.IRequest = URLVariables.parse(path);

        // VALIDATE PARAMETERS
        if (typeof params.gid !== "number" || typeof params.pid !== "number" || typeof params.name !== "string")
            return new WebError(400, "Invalid parameter");
        else if (this.games.has(params.gid) === false)
            return new WebError(404, "Unable to find the matched game.");
        else if (this.users.has(params.name) === false)
            return new WebError(401, "Invalid authorization.");

        // SELECT USER & GAME
        let user: UserAgent = this.users.get(params.name);
        let game: GameAgent = this.games.get(params.gid);

        // THE LAST VALIDATION
        if (user.uid !== params.pid)
            return new WebError(401, "Invalid authorization.");
        else if (game.players_.has(user) || game.observers_.has(user))
            return new WebError(403, "You are already parcipating in the game.");
        else if (addiction)
        {
            let error: WebError | null = addiction(user, game);
            if (error)
                return error;
        }
        return new Pair(user, game);
    }
}