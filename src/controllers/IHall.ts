import { IGame } from "../features/IGame";
import { Role } from "../features/Role";

export interface IHall
{
    setName(value: string): IGame[] | false;
    participatable(game: number, role: Role): string | null;
}