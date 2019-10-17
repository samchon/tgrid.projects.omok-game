import React from "react";
import { WebConnector } from "tgrid/protocols/web/WebConnector";
import { Player } from "../providers/Player";

export class ObserverMovie extends React.Component<ObserverMovie.IProps>
{
    public render(): JSX.Element
    {
        return <React.Fragment>
            <h2> Game #{this.props.uid} </h2>
            <button onClick={this.props.closure}> Exit </button>
        </React.Fragment>;
    }
}
export namespace ObserverMovie
{
    export interface IProps
    {
        uid: number;
        connector: WebConnector<Player>;
        closure: ()=>void;
    }
}