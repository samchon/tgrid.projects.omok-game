import { HashSet } from "tstl/container/HashSet";

import { ServerAgent } from "./ServerAgent";
import { HallService } from "../services/HallService";
import { ObserverService } from "../services/ObserverService";

import { Global } from "../../Global";

export class UserAgent
{
    public readonly server: ServerAgent;
    private hall_: HallService | null;
    private participants_: HashSet<ObserverService<any>>;

    public readonly uid: number;
    public readonly name: string;

    public constructor(server: ServerAgent, hall: HallService, name: string)
    {
        this.server = server;
        this.hall_ = hall;
        this.participants_ = new HashSet();

        this.uid = Global.increment();
        this.name = name;
    }

    public participate(service: ObserverService<any>): void
    {
        this.participants_.insert(service);
    }

    public unlink(service: HallService | ObserverService<any>): void
    {
        // ERASE SERVICE
        if (service instanceof HallService)
            this.hall_ = null;
        else
            this.participants_.erase(service);

        // ERASE USER
        if (this.hall_ === null && this.participants_.empty())
            this.server.users.erase(this.name);
    }

    public size(): number
    {
        return this.participants_.size();
    }
}