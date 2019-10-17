export interface IObserverService
{
    talk(content: string): void;
}
export namespace IObserverService
{
    export interface IRequest
    {
        gid: number;
        pid: number;
        name: string;
    }
}