import "core-js";
import React from "react";
import ReactDOM from "react-dom";

import { WebConnector } from "tgrid/protocols/web/WebConnector";
import { Driver } from "tgrid/components/Driver";

import { IHall } from "../controllers/IHall";
import { Awaitor } from "./providers/Awaitor";
import { IntroPage } from "./pages/IntroPage";

import { Global } from "../Global";

window.onload = async function ()
{
    let awaitor: Awaitor = new Awaitor();
    let connector: WebConnector = new WebConnector(awaitor);
    let hall: Driver<IHall> = connector.getDriver();

    await connector.connect(Global.url("/"));

    ReactDOM.render(<IntroPage awaitor={awaitor} hall={hall} />, document.body);
}