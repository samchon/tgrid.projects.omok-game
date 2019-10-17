import { IObserver } from "./IObserver";

export interface IPlayer extends IObserver
{
    put(row: number, cell: number): boolean;
}