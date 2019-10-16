import React = require("react");

import { Driver } from "tgrid/components/Driver";

import { IHall } from "../../controllers/IHall";
import { Awaitor } from "../providers/Awaitor";
import { HallMovie } from "../movies/HallMovie";

export class GamePage extends React.Component<GamePage.IProps>
{
    public render(): JSX.Element
    {
        return <React.Fragment>
            <HallMovie {...this.props} />
        </React.Fragment>;
    }
}
export namespace GamePage
{
    export interface IProps
    {
        awaitor: Awaitor;
        service: Driver<IHall>;
    }
}