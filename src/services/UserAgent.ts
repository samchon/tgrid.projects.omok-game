import { Global } from "../Global";

export class UserAgent
{
    public readonly uid: number;
    public readonly name: string;

    public constructor(name: string)
    {
        this.uid = Global.increment();
        this.name = name;
    }
}