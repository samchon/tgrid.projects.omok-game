import { Vector } from "tstl/container/Vector";

import { Color } from "./Color";

export class Board
{
    private size_: number;
    private data_: Color[][];

    private histories_: Vector<Board.ICell>;
    private next_: Board.INext;

    /* ----------------------------------------------------------------
        CONSTRUCTOR
    ---------------------------------------------------------------- */
    public constructor(size: number)
    {
        // MEMBERS
        this.size_ = size;
        this.data_ = new Array(size);
        this.histories_ = new Vector();
        this.next_ = {} as any;
        
        for (let i: number = 0; i < size; ++i)
            this.data_.push(new Array(size));
        
        // INITIAL HISTORIES
        let pos: number = size / 2 - 1;
        
        this.put(pos - 1, pos - 1, Color.WHITE);
        this.put(pos + 1, pos - 1, Color.BLACK);
        this.put(pos + 1, pos + 1, Color.WHITE);
        this.put(pos - 1, pos + 1, Color.BLACK);
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    public size(): number
    {
        return this.size_;
    }

    public data(): Color[][]
    {
        return this.data_;
    }

    public at(row: number, col: number): Color
    {
        return this.data_[row][col];
    }

    public latest(): Board.ICell
    {
        return this.histories_.back();
    }

    /* ----------------------------------------------------------------
        PLAYS
    ---------------------------------------------------------------- */
    public put(row: number, col: number, color: Color): Board.INext
    {
        this.histories_.push_back({ 
            row: row, 
            col: col, 
            color: color
        });

        this.next_ = {
            color: (color === Color.BLACK) ? Color.WHITE : Color.BLACK
        };
        return this.next_;
    }
}

export namespace Board
{
    export interface ICell extends IPosition
    {
        color: Color;
    }

    export interface INext
    {
        color: Color | null;
    }

    export interface IPosition
    {
        row: number;
        col: number;
    }
}