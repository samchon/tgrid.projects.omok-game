import React = require("react");

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import { Driver } from "tgrid/components/Driver";

import { IHall } from "../../controllers/IHall";
import { Awaitor } from "../providers/Awaitor";

export class HallMovie extends React.Component<HallMovie.IProps>
{
    public constructor(props: HallMovie.IProps)
    {
        super(props);

        // props.awaitor.onChange = () =>
        // {
        //     this.setState({});
        // };
    }

    public render(): JSX.Element
    {
        return <React.Fragment>
        {this.props.awaitor.games.map(game =>
            <Card>
                <CardContent>
                    <h2> Game #{game.uid} </h2>
                    <ul>
                        <li> Players: {game.players ? game.players : " - "} </li>
                        <li> Observers: #{game.observers.length} </li>
                    </ul>
                </CardContent>
                <CardActions>
                    <Button color="primary"> Be Player </Button>
                    <Button color="primary"> Be Observer </Button>
                </CardActions>
            </Card>
        )}
        </React.Fragment>
    }
}
export namespace HallMovie
{
    export interface IProps
    {
        awaitor: Awaitor;
        service: Driver<IHall>;
    }
}