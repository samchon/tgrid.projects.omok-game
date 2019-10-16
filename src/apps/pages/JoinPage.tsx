import React from "react";
import ReactDOM from "react-dom";

import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import MenuBookIcon from "@material-ui/icons/MenuBook";
import GitHubIcon from "@material-ui/icons/Github";

import { Driver } from "tgrid/components/Driver";

import { IHall } from "../../controllers/IHall";
import { Awaitor } from "../providers/Awaitor";
import { GamePage } from "./GamePage";
import { Global } from "../../Global";

export class JoinPage extends React.Component<JoinMovie.IProps>
{
    private get name_input_(): HTMLInputElement
    {
        return document.getElementById("name_input") as HTMLInputElement;
    }

    /* ----------------------------------------------------------------
        EVENT HANDLERS
    ---------------------------------------------------------------- */
    public componentDidMount(): void
    {
        this.name_input_.select();
    }

    private _Open_link(url: string): void
    {
        window.open(url, "_blank");
    }

    private _Handle_keyUp(event: React.KeyboardEvent): void
    {
        if (event.keyCode === 13)
            this._Participate();
    }

    private async _Participate(): Promise<void>
    {
        let value: string = this.name_input_.value;
        if (value === "")
        {
            alert("The name cannot be empty.");
            return;
        }

        let service: Driver<IHall> = this.props.service;
        if (await service.setName(value) === false)
        {
            alert("Duplicated name exists.");
            return;
        }

        ReactDOM.render(<GamePage {...this.props} />, document.body);
    }

    /* ----------------------------------------------------------------
        RENDERER
    ---------------------------------------------------------------- */
    public render(): JSX.Element
    {
        return <React.Fragment>
            <AppBar>
                <Toolbar>
                    <Typography variant="h6"> Othello Game </Typography>
                    <div style={{ flexGrow: 1 }} />
                    <IconButton color="inherit" 
                                onClick={this._Open_link.bind(this, Global.BOOK)}>
                        <MenuBookIcon />
                    </IconButton>
                    <IconButton color="inherit"
                                onClick={this._Open_link.bind(this, Global.GITHIB)}>
                        <GitHubIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Toolbar />
            <Container>
                <p> Insert your name: </p>
                <p>
                    <Input id="name_input" 
                           placeholder="Your Name"
                           onKeyUp={this._Handle_keyUp.bind(this)} /> 
                    {" "}
                    <Button color="primary" 
                            variant="outlined" 
                            onClick={this._Participate.bind(this)}> Enter </Button>
                </p>
            </Container>
        </React.Fragment>;
    }
}
export namespace JoinMovie
{
    export interface IProps
    {
        awaitor: Awaitor;
        service: Driver<IHall>;
    }
}
