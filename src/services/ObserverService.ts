import { Driver } from "tgrid/components/Driver";
import { IObserver } from "../controllers/IObserver";

import { UserAgent } from "./UserAgent";
import { Game } from "./Game";
import { WebAcceptor } from "tgrid/protocols/web/WebAcceptor";

export class ObserverService<Controller extends IObserver = IObserver>
{
    public readonly user_: UserAgent;
    public readonly game_: Game;
    public readonly participant_: Driver<Controller>;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    protected constructor(user: UserAgent, game: Game, observer: Driver<Controller>)
    {
        this.user_ = user;
        this.game_ = game;
        this.participant_ = observer;
    }

    public static async initialize
        (
            user: UserAgent, 
            game: Game, 
            acceptor: WebAcceptor<ObserverService>
        ): Promise<ObserverService>
    {
        let observer: Driver<IObserver> = acceptor.getDriver();
        let service: ObserverService = new ObserverService(user, game, observer);

        await acceptor.accept(service);
        game.participate(service);

        return service;
    }

    public destructor(): void
    {
        this.game_.unlink(this);
        this.user_.unlink(this);
    }

    /* ----------------------------------------------------------------
        FUCTION FOR THE REMOTE SYSTEM
    ---------------------------------------------------------------- */
    public talk(content: string): void
    {
        for (let map of [this.game_.players_, this.game_.observers_])
            for (let it of map)
            {
                let p = it.second.participant_.printTalk(this.user_.name, content);
                p.catch(() => {});
            }
    }
}
