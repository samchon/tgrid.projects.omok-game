import React from "react";
import { WebConnector } from "tgrid/protocols/web/WebConnector";
import { Player } from "../providers/Player";

export class PlayerMovie extends React.Component<PlayerMovie.IProps>
{
    public render(): JSX.Element
    {
        return <React.Fragment>
            <h2> Game #{this.props.uid} </h2>
            <button onClick={this.props.closure}> Exit </button>
        </React.Fragment>;
    }
}
export namespace PlayerMovie
{
    export interface IProps
    {
        uid: number;
        connector: WebConnector<Player>;
        closure: ()=>void;
    }
}