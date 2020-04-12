import React from 'react';
import './Faucet.css'
import FaucetJSON from '../../bin/src/solc-src/faucet/Faucet.json'
import { getContractAddressFromStoreByName } from '../bl/utility'

import {
    FAUCET_CONTRACT_NAME,
    EHTER_UNIT_NAME,
    RDTOKEN_FAUCET_CONTRACT_NAME,
} from '../common'

const WITHDRAW = 'withdraw';
const DEPOSIT = 'deposit';
const BALANCE = 'balance';

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
            destinationAddress: "",
        }
    }

    onChangeAmount = (event) => {
        this.setState({
            amount: event.target.value
        })
    }

    onChangeDestAddress = (event) => {
        this.setState({
            destinationAddress: event.target.value
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
                this.withdrawFunds(web3, contract, amount, userAddress)
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
            default:
                console.log('Nothing....')
                break;
        }
    }

    withdrawFunds = (web3, contract, amount, userAddress) => {
        const destinationAddr = this.state.destinationAddress
        if (amount <= 0) {
            console.error(`Aborting funds deposit, amount is invalid ${amount}`)
            return
        }

        const convertedAmount = this.props.withdrawValueConverter(amount,web3);
        const userFrom = destinationAddr && destinationAddr.length && destinationAddr !== '' ? destinationAddr : userAddress;
        console.log('from ', userFrom, convertedAmount)

        try {
            
            contract.methods.withdraw(convertedAmount)
            .estimateGas({
                from: userAddress,
            }).then(gesEst => {

                console.log(`Withdraw funds gas estimation ${gesEst}`)
                /**
                 * Withdraw function modify the contract's state, so 
                 * send is nededed; a new transacation will be generated
                 * on the blockchain
                */
                contract.methods.withdraw(convertedAmount).send({
                    from: userAddress,
                    gas: gesEst,
                    gasPrice: 200000000000,
                }).then(res => console.log(`Amount withdrawen from faucet ${this.props.balanceGetterConverter(convertedAmount)}`,res))
                    .catch(err => console.error(`Error while withdrawing ether `, err))

            })
            .catch(err => {
                console.log(`Withdraw funds error `, err)
            })
            
        } catch (error) {
            console.error('Generic error withdrawFunds method : ',error)
        }

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
        }).then(res => {
            console.log(`Faucet balance :  ${res}`)
            const balanceInEther = this.props.balanceGetterConverter(res, web3);
            this.setState({
                faucetBalance: balanceInEther,
            })
            return res
        }).catch(ret => {
            console.log(`Faucet balance : `, ret)
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
                    <h3>{`${this.props.title} ${this.state.faucetBalance ? this.state.faucetBalance : ""}`}</h3>
                    <label>Amount: </label>
                    <input type="number" value={this.state.amount} onChange={this.onChangeAmount} min="0"></input>
                    {
                        this.props.contractName === RDTOKEN_FAUCET_CONTRACT_NAME ?
                            <div>
                                <label>Address: </label>
                                <input type="text" value={this.state.destinationAddress} onChange={this.onChangeDestAddress}></input>
                            </div> : undefined
                    }
                    <div className="Faucet-Operations">
                        <button onClick={() => this.onOperationClick(BALANCE)}>Balance</button>
                        <button onClick={() => this.onOperationClick(WITHDRAW)}>Withdraw</button>
                        <button
                            disabled={this.props.contractName === RDTOKEN_FAUCET_CONTRACT_NAME}
                            onClick={() => this.onOperationClick(DEPOSIT)}>Deposit</button>
                    </div>
                </div>
            </article>
        );
    }

}

export function FaucetDashboardBuilder(nextProps, userAddress, web3) {
    const storedContractAddress = getContractAddressFromStoreByName(FAUCET_CONTRACT_NAME)
    nextProps.selectedContractComponent = storedContractAddress ?
        <Faucet
            title="Faucet"
            contractName={FAUCET_CONTRACT_NAME}
            userAddress={userAddress}
            contractAddress={window.localStorage.getItem(FAUCET_CONTRACT_NAME)}
            json={FaucetJSON}
            web3={web3}
            balanceGetterConverter={(val, web3) => '( ' + web3.utils.fromWei(String(val), EHTER_UNIT_NAME) + ' ETH )'}
            withdrawValueConverter={(amount, web3) => web3.utils.toWei(String(amount), EHTER_UNIT_NAME)}
        />
        : undefined;
    nextProps.selectedContractJSON = FaucetJSON;
    nextProps.selectedContractName = FAUCET_CONTRACT_NAME;
    nextProps.selectedContractABI = FaucetJSON.abi;
    nextProps.selectedContractBytecode = FaucetJSON.bytecode;
    nextProps.selectedContractAddress = storedContractAddress ? storedContractAddress : "";
    return nextProps
}