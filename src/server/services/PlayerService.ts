import { Driver } from "tgrid/components/Driver";
import { IPlayer } from "../../controllers/IPlayer";

import { GameAgent } from "../agents/GameAgent";
import { Color } from "../../features/Color";
import { ObserverService } from "./ObserverService";
import { UserAgent } from "../agents/UserAgent";
import { Board } from "../../features/Board";
import { WebAcceptor } from "tgrid/protocols/web/WebAcceptor";

export class PlayerService extends ObserverService<IPlayer>
{
    public readonly color_: Color;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    private constructor(user: UserAgent, game: GameAgent, color: Color, player: Driver<IPlayer>)
    {
        super(user, game, player);
        this.color_ = color;
    }

    public static async initialize
        (
            user: UserAgent, 
            game: GameAgent, 
            acceptor: WebAcceptor<PlayerService>
        ): Promise<PlayerService>
    {
        let color: Color = game.players_.empty() 
            ? Color.BLACK 
            : Color.WHITE;
        let player: Driver<IPlayer> = acceptor.getDriver();
        let service: PlayerService = new PlayerService(user, game, color, player);

        await acceptor.accept(service);
        user.participate(service);
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