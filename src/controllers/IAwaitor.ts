import { IGame } from "../features/IGame";

export interface IAwaitor
{
    assign(games: IGame[]): void;
    insert(game: IGame): void;
    erase(uid: number): void;
    update(uid: number, game: IGame): void;
}