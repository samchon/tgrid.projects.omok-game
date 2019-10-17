import { IGame } from "../features/IGame";

import { Board } from "../features/Board";
import { Color } from "../features/Color";

export interface IObserver
{
    assign(game: IGame): void;
    printBoard(board: Color[][], next: Board.INext): void;
    printTalk(from: string, content: string): void;
}