export namespace Global
{
    export const PORT = 10202;
    export const LIMIT = 3;

    export const BOOK = "https://tgrid.dev/en/tutorial/projects/othello";
    export const GITHIB = "https://github.com/samchon/tgrid.projects.othello";

    export function increment(): number
    {
        return ++SEQUENCE;
    }
    export function url(path: string): string
    {
        return `ws://${window.location.hostname}:${Global.PORT}${path}`;
    }

    var SEQUENCE: number = 0;
}