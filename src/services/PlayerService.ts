import { Driver } from "tgrid/components/Driver";
import { IPlayer } from "../controllers/IPlayer";

import { Game } from "./Game";
import { Color } from "../features/Color";
import { ObserverService } from "./ObserverService";
import { UserAgent } from "./UserAgent";
import { Board } from "../features/Board";

export class PlayerService extends ObserverService<IPlayer>
{
    public readonly color_: Color;

    public constructor(user: UserAgent, game: Game, color: Color, player: Driver<IPlayer>)
    {
        super(user, game, player);
        this.color_ = color;
    }

    public put(row: number, col: number): Board.INext
    {
        return this.game_.put(row, col, this.color_);
    }
}