import React = require("react");

import AddIcon from '@material-ui/icons/Add';
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Fab from "@material-ui/core/Fab";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import TextField from "@material-ui/core/TextField";

import { WebConnector } from "tgrid/protocols/web/WebConnector";
import { Driver } from "tgrid/components/Driver";
import { URLVariables } from "tgrid/utils/URLVariables";

import { IHall } from "../../controllers/IHall";
import { IGame } from "../../features/IGame";
import { IObserverService } from "../../controllers/IObserverService";
import { IUser } from "../../features/IUser";
import { Role } from "../../features/Role";

import { Awaitor } from "../providers/Awaitor";
import { Observer } from "../providers/Observer";
import { Player } from "../providers/Player";

import { Global } from "../../Global";

export class HallMovie extends React.Component<HallMovie.IProps>
{
    private show_dialog_: boolean;
    private size_: number;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    public constructor(props: HallMovie.IProps)
    {
        super(props);

        this.show_dialog_ = false;
        this.size_ = 8;

        props.awaitor.onChange = () =>
        {
            this.setState({});
        };
    }

    /* ----------------------------------------------------------------
        TO CREATE GAME
    ---------------------------------------------------------------- */
    private _Flip_dialog(): void
    {
        this.show_dialog_ = !this.show_dialog_;
        this.setState({});
    }

    private _Change_size(event: React.ChangeEvent<HTMLInputElement>): void
    {
        this.size_ = Number((event.target as HTMLInputElement).value);
        this.setState({});
    }

    private _Handle_keyUp(event: React.KeyboardEvent): void
    {
        if (event.keyCode === 13)
            this._Create_game();
    }

    private async _Create_game(): Promise<void>
    {
        try
        {
            let uid: number = await this.props.hall.createGame(8, "Something");
            await this._Be_player(uid);
        }
        catch (error)
        {
            alert(error.message);
        }
        this.show_dialog_ = false;
        this.setState({});
    }

    /* ----------------------------------------------------------------
        TO PARTICIPATE
    ---------------------------------------------------------------- */
    private async _Be_observer(uid: number): Promise<void>
    {
        try
        {
            let observer: Observer = new Observer();
            let connector: WebConnector<Observer> = await this._Participate(uid, "/observers", observer);

            this.props.inserter(uid, Role.OBSERVER, connector);
        }
        catch (error)
        {
            alert(error.message);
        }
    }

    private async _Be_player(uid: number): Promise<void>
    {
        try
        {
            let player: Player = new Player();
            let connector: WebConnector<Observer> = await this._Participate(uid, "/players", player);

            this.props.inserter(uid, Role.PLAYER, connector);
        }
        catch (error)
        {
            alert(error.message);
        }
    }

    private async _Participate<Provider extends Observer>
        (
            uid: number, 
            path: string,
            provider: Provider
        ): Promise<WebConnector<Provider>>
    {
        let connector: WebConnector<Provider> = new WebConnector(provider);
        let req: IObserverService.IRequest = {
            gid: uid,
            pid: this.props.user.uid,
            name: this.props.user.name
        };
        path += "?" + URLVariables.stringify(req);

        await connector.connect(Global.url(path));
        return connector;
    }

    /* ----------------------------------------------------------------
        RENDERERS
    ---------------------------------------------------------------- */
    public render(): JSX.Element
    {
        return <React.Fragment>
            { this.props.awaitor.games.map(game => this._Render_game(game)) }
            <Fab color="primary" 
                 style={{ position: "fixed", right: 25, bottom: 25 }}>
                <AddIcon onClick={this._Flip_dialog.bind(this)} />
            </Fab>
            <Dialog open={this.show_dialog_} 
                    onClose={this._Flip_dialog.bind(this)}>
                <DialogTitle> Create a new game </DialogTitle>
                <DialogContent>
                    <DialogContentText> Configurate the board size. </DialogContentText>
                    <RadioGroup value={this.size_}
                                onChange={this._Change_size.bind(this)}>
                    {[4, 6, 8, 12].map(size => (
                        <FormControlLabel control={<Radio />} 
                                          label={`${size} x ${size}`}
                                          value={size} />
                    ))}
                    </RadioGroup>
                    <TextField id="title_input" 
                               label="Title"
                               type="text"
                               autoFocus
                               fullWidth
                               onKeyUp={this._Handle_keyUp.bind(this)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this._Create_game.bind(this)}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>;
    }

    private _Render_game(game: IGame): JSX.Element
    {
        return <React.Fragment>
            <table style={{ width: "100%", 
                                border: "solid 1px black" }}>
                <tr style={{ backgroundColor: "green", 
                            color: "white",
                            fontSize: "larger" }}>
                    <td style={{ padding: PADDING }}> 
                        Game #{game.uid} 
                    </td>
                </tr>
                <tr style={{ backgroundColor: "whitesmoke" }}>
                    <td style={{ padding: PADDING }}>
                        {game.title}
                        <ul>
                            <li> Size: {game.size} x {game.size} </li>
                        <li> Players: {game.players ? "" : " - "} </li>
                        <ul>
                            {game.players.map(str => <li> {str} </li>)}
                        </ul>
                        <li> Observers: #{game.observers.length} </li>
                        </ul>
                    </td>
                </tr>
                <tr style={{ textAlign: "right",
                            backgroundColor: "yellowgreen" }}>
                    <td style={{ padding: PADDING / 2,
                                paddingRight: PADDING }}>
                        <Button color="primary"
                                onClick={this._Be_player.bind(this, game.uid)}>
                                    Play
                        </Button>
                        <Button color="primary"
                                onClick={this._Be_observer.bind(this, game.uid)}> 
                            Observer
                        </Button>                    
                    </td>
                </tr>
            </table>
            <br/>
        </React.Fragment>;
    }
}
export namespace HallMovie
{
    export interface IProps
    {
        user: IUser;
        awaitor: Awaitor;
        hall: Driver<IHall>;

        inserter: (uid: number, role: Role, connector: WebConnector) => void;
    }
}

const PADDING = 10;