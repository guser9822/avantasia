import React from 'react';

import FaucetJSON from '../../../bin/src/helloworld/Faucet.json'
export default class Faucet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            amount : 0
        }
    }

    onChangeAmount = (event) => {
        this.setState({
            amount: event.target.value
        })
    }

    onOperationClick = () => {
        console.log('clicked ',this.props.address)
    }

    render() {
        return (
            <article>
                <label>Withdraw/Deposit from Faucet: </label>
                <input type="number" value={this.state.amount} onChange={this.onChangeAmount} min="0"></input>
                <button onClick={this.onOperationClick}>Act!</button>
            </article>
        );
    }

}