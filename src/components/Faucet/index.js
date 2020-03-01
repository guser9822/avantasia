import React from 'react';

const WITHDRAW = 'withdraw';
const DEPOSIT = 'deposit';
const EHTER_UNIT_NAME = 'ether';
export default class Faucet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            amount: 0,
            contractAddress: props.contractAddress,
            userAddress: props.userAddress,
            faucetJSON: props.json,
            faucetABI: props.json.abi,
            web3: props.web3,
            faucetContract: new props.web3.eth.Contract(props.json.abi, props.contractAddress,
                {
                    from: props.contractAddress, // default from address
                    gasPrice: '20000000000',// default gas price in wei, 20 gwei in this case */
                }),
        }
    }

    onChangeAmount = (event) => {
        this.setState({
            amount: event.target.value
        })
    }

    onOperationClick = (selection) => {

        const contractAddress = this.state.contractAddress
        const web3 = this.state.web3
        const userAddress = this.state.userAddress
        const amount = this.state.amount

        switch (selection) {

            case WITHDRAW:

                break;
            case DEPOSIT:

                const wei = web3.utils.toWei(String(amount), EHTER_UNIT_NAME)

                web3.eth.sendTransaction({
                    from: userAddress,
                    to: contractAddress,
                    gas: 300000,//GAS LIMIT, to estimate!
                    gasPrice: 200000000000,
                    value: wei,
                }).then(res => {
                    console.log('DEPOSIT SUCCESS : ', res)
                }).catch(err => {
                    console.log('DEPOSIT ERROR: ', err)
                })

                break
        }
    }

    render() {
        return (
            <article>
                <h3>Faucet Component</h3>
                <label>Amount: </label>
                <input type="number" value={this.state.amount} onChange={this.onChangeAmount} min="0"></input>
                <button onClick={() => this.onOperationClick(WITHDRAW)}>Withdraw</button>
                <button onClick={() => this.onOperationClick(DEPOSIT)}>Deposit</button>
            </article>
        );
    }

}