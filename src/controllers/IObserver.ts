import { IGame } from "../features/IGame";

import { Board } from "../features/Board";
import { Color } from "../features/Color";
import { Role } from "../features/Role";

export interface IObserver
{
    assign(game: IGame): void;
    printBoard(board: Color[][], next: Board.INext): void;
    printTalk(from: string, content: string): void;
}
export namespace IObserver
{
    export interface IRequest
    {
        gid: number;
        pid: number;
        name: string;
        role: Role;
    }
}