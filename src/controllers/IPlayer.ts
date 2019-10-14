import { IObserver } from "./IObserver";
import { Color } from "../features/Color";

export interface IPlayer extends IObserver
{
    put(row: number, cell: number): boolean;
}
export namespace IPlayer
{
    export interface IRequest extends IObserver.IRequest
    {
        color: Color;
    }
}