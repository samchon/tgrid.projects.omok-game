import { IAwaitor } from "../../controllers/IAwaitor";
import { IGame } from "../../features/IGame";

export class Awaitor implements IAwaitor
{
    public games: IGame[] = [];
    public onChange: Function = () => {};

    public assign(games: IGame[]): void
    {
        this.games = games;
        console.log("Have come");

        this.onChange();
    }

    public insert(game: IGame): void
    {
        this.games.push(game);
        this.onChange();
    }

    public erase(uid: number): void
    {
        let index: number = this.games.findIndex(g => g.uid === uid);
        if (index !== -1)
        {
            this.games.splice(index, 1);
            this.onChange();
        }
    }

    public update(uid: number, game: IGame): void
    {
        let index: number = this.games.findIndex(g => g.uid === uid);
        if (index !== -1)
        {
            this.games[index] = game;
            this.onChange();
        }
    }
}