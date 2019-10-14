import { Driver } from "tgrid/components/Driver";
import { IObserver } from "../controllers/IObserver";

import { UserAgent } from "./UserAgent";
import { Game } from "./Game";

export class ObserverService<Controller extends IObserver = IObserver>
{
    public readonly user_: UserAgent;
    public readonly game_: Game;
    public readonly observer_: Driver<Controller>;

    public constructor(user: UserAgent, game: Game, observer: Driver<Controller>)
    {
        this.user_ = user;
        this.game_ = game;
        this.observer_ = observer;
    }

    public async destructor(): Promise<void>
    {
        
    }

    public talk(content: string): void
    {
        for (let map of [this.game_.players_, this.game_.observers_])
            for (let it of map)
            {
                let p = it.second.observer_.printTalk(this.user_.name, content);
                p.catch(() => {});
            }
    }
}
