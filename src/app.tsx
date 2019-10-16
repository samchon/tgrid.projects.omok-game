import "core-js";
import React from "react";
import ReactDOM from "react-dom";

import { WebConnector } from "tgrid/protocols/web/WebConnector";
import { Driver } from "tgrid/components/Driver";

import { IHall } from "./controllers/IHall";
import { Awaitor } from "./apps/providers/Awaitor";
import { JoinPage } from "./apps/pages/JoinPage";

import { Global } from "./Global";

window.onload = async function ()
{
    let awaitor: Awaitor = new Awaitor();
    let connector: WebConnector = new WebConnector(awaitor);
    let service: Driver<IHall> = connector.getDriver();

    await connector.connect(Global.url("/"));

    ReactDOM.render(<JoinPage awaitor={awaitor} service={service} />, document.body);
}