import { Role } from "../features/Role";

export interface IHall
{
    setName(value: string): boolean;
    createGame(size: number): void;
    participatable(game: number, role: Role): string | null;
}