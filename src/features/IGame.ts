import { Color } from "./Color";

export interface IGame
{
    uid: number;
    size: number;
    players: string[];
    observers: string[];
    winner?: Color | null;
}