import React from "react";

import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import ListIcon from '@material-ui/icons/List';
import VideogameAssetIcon from '@material-ui/icons/VideogameAsset';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { WebConnector } from "tgrid/protocols/web/WebConnector";
import { Driver } from "tgrid/components/Driver";

import { IHall } from "../../controllers/IHall";
import { IUser } from "../../features/IUser";
import { Role } from "../../features/Role";

import { Awaitor } from "../providers/Awaitor";
import { HallMovie } from "../movies/HallMovie";
import { PlayerMovie } from "../movies/PlayerMovie";
import { ObserverMovie } from "../movies/ObserverMovie";

export class HallPage extends React.Component<HallPage.IProps>
{
    private games_: IGameProps[] = [];
    private index_: number = 0;

    /* ----------------------------------------------------------------
        EVENT HANDLERS
    ---------------------------------------------------------------- */
    private _Insert(uid: number, role: Role, connector: WebConnector): void
    {
        // INSERT
        this.games_.push( 
        { 
            uid: uid, 
            role: role, 
            connector: connector 
        });

        // REFRESH
        this._Change_index(null, this.games_.length);
    }

    private async _Erase(uid: number): Promise<void>
    {
        // FIND THE MATCHED GAME
        let index: number = this.games_.findIndex(g => g.uid === uid);
        let game: IGameProps = this.games_[index];
        
        // ERASE & REFRESH
        this.games_.splice(index, 1);
        this._Change_index(null, 0);

        // INFORM TO SERVER
        await game.connector.close();
    }

    private _Change_index({}: any, index: number): void
    {
        this.index_ = index;
        this.setState({});
    }

    /* ----------------------------------------------------------------
        RENDERERS
    ---------------------------------------------------------------- */
    public render(): JSX.Element
    {
        let hallProps: HallMovie.IProps = {
            ...this.props,
            inserter: this._Insert.bind(this)
        };

        return <React.Fragment>
            <AppBar>
                <Tabs value={this.index_}
                      onChange={this._Change_index.bind(this)}>
                    <Tab label="List"
                         icon={<ListIcon />} />
                    {this.games_.map(g => (
                        <Tab label={`Game #` + g.uid}
                             icon={g.role === Role.PLAYER
                                ? <VideogameAssetIcon />
                                : <VisibilityIcon />}
                        />
                    ))}
                </Tabs>
            </AppBar>
            <Box hidden={this.index_ !== 0}
                 style={{ paddingTop: PADDING_TOP, paddingBottom: PADDING_TOP }}>
                <HallMovie {...hallProps } />
            </Box>
            {this.games_.map((game, index) => this._Render_game(game, index + 1))}
        </React.Fragment>;
    }

    private _Render_game(game: IGameProps, index: number): JSX.Element
    {
        let props: PlayerMovie.IProps | ObserverMovie.IProps = 
        {
            uid: game.uid,
            connector: game.connector,
            closure: this._Erase.bind(this, game.uid)
        };

        return <Box hidden={index !== this.index_}
                    style={{ paddingTop: PADDING_TOP }}>
            {game.role === Role.PLAYER
                ? <PlayerMovie {...props} />
                : <ObserverMovie {...props} />
            }
        </Box>;
    }
}
export namespace HallPage
{
    export interface IProps
    {
        user: IUser;
        awaitor: Awaitor;
        hall: Driver<IHall>;
    }
}

interface IGameProps
{
    uid: number;
    role: Role;
    connector: WebConnector;
}

const PADDING_TOP: number = 75;