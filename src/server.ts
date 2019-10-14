import { ServerAgent } from "./services/ServerAgent";
import { Global } from "./Global";

async function main(): Promise<void>
{
    let server: ServerAgent = new ServerAgent();
    await server.open(Global.PORT);
}
main();