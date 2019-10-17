import { IObserverService } from "./IObserverService";

export interface IPlayerService extends IObserverService
{
    put(row: number, col: number): void;
}
export namespace IPlayerService
{
    export type IRequest = IObserverService;
}