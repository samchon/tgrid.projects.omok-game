export namespace Global
{
    export const PORT = 10202;

    export const TGRID = "https://tgrid.dev";
    export const REPOSITORY = "https://github.com/samchon/tgrid.projects.othello";
    export const GUIDE_EN = TGRID + "/en/tutorial/projects/othello.html";
    export const GUIDE_KR = TGRID + "/ko/tutorial/projects/othello.html";

    export function increment(): number
    {
        return ++SEQUENCE;
    }
    var SEQUENCE: number = 0;
}