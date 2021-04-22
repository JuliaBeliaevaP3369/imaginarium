import React, {Component} from 'react';
import './Preparation.scss';
import {Redirect} from "react-router-dom";
import cn from "classnames";

interface IState {
    summited: boolean;
    name: string;

}

interface IProps {
    onSubmit: (name: string) => void;
    isGameStarted: boolean;
    readyUsers:  {
        readyNumber: number;
        allNumber: number;
    };
}

class Preparation extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            summited: false,
            name: ''
        };
    }

    onNameChanges = (e: any) => {
        this.setState({
            name: e.target.value
        })
    }


    onSubmit = () => {
        this.props.onSubmit(this.state.name);
        this.setState({
            summited: true
        });
    }

    render() {
        if (this.props.isGameStarted) {
            return <Redirect to="/game" />
        }
        const ready = this.props.readyUsers;
        return (
            <div className="preparation">
                <div className={cn("container", {'wrapper': this.state.summited})}>
                    {
                        this.state.summited ?
                        <>
                            <div className="one">Имаджинариум</div>
                            <h1 className="hi" style={{}}>Привет, <strong>{this.state.name}</strong></h1>
                            <p className="two">Игра скоро начнется...</p>
                            <div className="ready">Готовы к игре: <span>{ready.readyNumber}</span> / {ready.allNumber}</div>
                        </> :
                        <>
                            <h1>Имаджинариум</h1>
                            <label htmlFor="description">Введи имя:</label> <br />
                            <div className="box_top"><input type="text" onChange={this.onNameChanges} /></div>
                            <div className="big_box">
                                <button onClick={this.onSubmit}>Готов!</button>
                            </div>
                            <div className="ready">Готовы к игре: <span>{ready.readyNumber}</span> / {ready.allNumber}</div>
                        </>
                    }
               </div>
            </div>
        );
    }
}

export default Preparation;
