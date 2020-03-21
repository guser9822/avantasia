import React from 'react';
import './Faucet.css'
const WITHDRAW = 'withdraw';
const DEPOSIT = 'deposit';
const BALANCE = 'balance';
const EHTER_UNIT_NAME = 'ether';
const DEFAULT_GAS_LIMIT = 5000000

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
                    from: props.userAddress, // default from address
                    gasPrice: '20000000000',// default gas price in wei, 20 gwei in this case */
                }),
            faucetBalance: undefined,
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
        const contract = this.state.faucetContract

        switch (selection) {

            case WITHDRAW:
                this.withdrawFunds(web3, contract, amount)
                break;
            case DEPOSIT:
                this.depositFunds(contractAddress, web3, userAddress, amount)
                break;
            case BALANCE:
                const val = this.getFaucetBalance(web3, contract, userAddress)
                this.setState({
                    faucetBalance: val,
                })
                break;
        }
    }

    withdrawFunds = (web3, contract, amount, userAddress) => {
        if (amount <= 0) {
            console.error(`Aborting funds deposit, amount is invalid ${amount}`)
            return
        }

        const wei = web3.utils.toWei(String(amount), EHTER_UNIT_NAME)
        contract.methods.withdraw(wei).
            estimateGas({
                from: userAddress,
            }).then(gesEst => {

                console.log(`Withdraw funds gas estimation ${gesEst}`)
                /**
                 * Withdraw function modify the contract's state, so 
                 * send is nededed; a new transacation will be generated
                 * on the blockchain
                */
                contract.methods.withdraw(wei).send({
                    from: userAddress,
                    gas: gesEst,
                    gasPrice: 200000000000,
                }).then(res => console.log(`Amount withdrawen from faucet ${wei}`, res))
                    .catch(err => console.error(`Error while withdrawing ether `, err))

            })
            .catch(err => {
                console.log(`Withdraw funds error `, err)
            })

    }

    getFaucetBalance = (web3, contract, userAddress) => {

        if (!contract || !userAddress) {
            return 'error..'
        }
        /**
         * Call does not create a transaction, it call
         * method that does not modify contract state
         */
        contract.methods.getBalance().call({
            from: userAddress,
            gas: 300000,//TODO GAS LIMIT, to estimate!
            gasPrice: 200000000000,
        }).then(res => {
            console.log(`Faucet balance :  ${res}`)
            const balanceInEther = '( ' +web3.utils.fromWei(String(res), EHTER_UNIT_NAME) + ' ETH )'
            this.setState({
                faucetBalance: balanceInEther,
            })
            return res
        }).catch(ret => {
            console.log(`Faucet balance : `,ret)
            return 'error..'
        })
        return 'gathering...'
    }

    depositFunds = (contractAddress, web3, userAddress, amount) => {

        if (amount <= 0) {
            console.error(`Aborting funds deposit, amount is invalid ${amount}`)
            return
        }

        const wei = web3.utils.toWei(String(amount), EHTER_UNIT_NAME)

        web3.eth.estimateGas({
            from: userAddress,
            to: contractAddress,
            value: wei,
        }).then(gesEst => {

            console.log(`Send transaction gas estimation ${gesEst}`)
            web3.eth.sendTransaction({
                from: userAddress,
                to: contractAddress,
                gas: gesEst,
                gasPrice: 200000000000,
                value: wei,
            }).then(res => {
                console.log(`DEPOSIT SUCCESS :  `, res)
            }).catch(err => {
                console.log(`DEPOSIT ERROR:  `, err)
            })

        }).catch(err => console.error(`Send transaction gas estimation error: `, err))

    }

    render() {
        return (
            <article>
                <div className="Faucet">
                    <h3>Faucet Component {this.state.faucetBalance}</h3>
                    <label>Amount: </label>
                    <input type="number" value={this.state.amount} onChange={this.onChangeAmount} min="0"></input>
                    <div className="Faucet-Operations">
                        <button onClick={() => this.onOperationClick(BALANCE)}>Balance</button>
                        <button onClick={() => this.onOperationClick(WITHDRAW)}>Withdraw</button>
                        <button onClick={() => this.onOperationClick(DEPOSIT)}>Deposit</button>
                    </div>
                </div>
            </article>
        );
    }

}