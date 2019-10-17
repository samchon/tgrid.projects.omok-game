import { Color } from "./Color";

export interface IGame
{
    uid: number;
    size: number;
    title: string;
    
    players: string[];
    observers: string[];

    winner?: Color | null;
}