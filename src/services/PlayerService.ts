import { Driver } from "tgrid/components/Driver";
import { IPlayer } from "../controllers/IPlayer";

import { Game } from "./Game";
import { Color } from "../features/Color";
import { ObserverService } from "./ObserverService";
import { UserAgent } from "./UserAgent";
import { Board } from "../features/Board";
import { WebAcceptor } from "tgrid/protocols/web/WebAcceptor";

export class PlayerService extends ObserverService<IPlayer>
{
    public readonly color_: Color;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    public constructor(user: UserAgent, game: Game, color: Color, player: Driver<IPlayer>)
    {
        super(user, game, player);
        this.color_ = color;
    }

    public static async initialize
        (
            user: UserAgent, 
            game: Game, 
            acceptor: WebAcceptor<PlayerService>
        ): Promise<PlayerService>
    {
        let color: Color = game.players_.empty() ? Color.BLACK : Color.WHITE;
        let player: Driver<IPlayer> = acceptor.getDriver();
        let service: PlayerService = new PlayerService(user, game, color, player);

        await acceptor.accept(service);
        game.participate(service);

        return service;
    }

    /* ----------------------------------------------------------------
        FUCTIONS FOR THE REMOTE SYSTEM
    ---------------------------------------------------------------- */
    public put(row: number, col: number): Board.INext
    {
        return this.game_.put(row, col, this.color_);
    }
}