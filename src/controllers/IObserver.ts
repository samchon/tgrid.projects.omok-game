import { Color } from "../features/Color";
import { Role } from "../features/Role";
import { Board } from "../features/Board";

export interface IObserver
{
    assignParticipants(players: string[], observers: string[]): void;
    printGame(board: Color[][], next: Board.INext): void;
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