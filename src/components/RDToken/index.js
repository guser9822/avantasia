import React from 'react';
import './RDToken.css'
import RDTokenJSON from '../../bin/src/solc-src/RDToken/RDToken.json'
import {
    getContractAddressFromStoreByName,
    amountFromToken,
    amountToToken,
} from '../bl/utility'

import {
    RDTOKEN_CONTRACT_NAME,
} from '../common'

const TOTAL_SUPPLY = 'total_supply';
const ACCOUNT_BALANCE = 'account_balance';
const TRANSFER = 'transfer';
const APPROVE = 'approve';
const ALLOWANCE = 'allowance';

const CONTRACT_DECIMALS = 2
export default class RDToken extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            amount: 0,
            contractAddress: props.contractAddress,
            userAddress: props.userAddress,
            rdTokenJSON: props.json,
            rdTokenABI: props.json.abi,
            web3: props.web3,
            rdTokenContract: new props.web3.eth.Contract(props.json.abi, props.contractAddress,
                {
                    from: props.userAddress, // default from address
                    gasPrice: '20000000000',// default gas price in wei, 20 gwei in this case */
                }),
            totalSupply: undefined,
            otherAddress: "",
            balanceAtAddress: undefined,
            rdTokenUnit: 0,
        }
    }

    clearForm = () => {
        this.setState({
            totalSupply: undefined,
            otherAddress: "",
            balanceAtAddress: undefined,
            rdTokenUnit: 0,
        })
    }

    onOperationClick = (operation) => {

        switch (operation) {
            case TOTAL_SUPPLY:
                this.getTotalSupply(this.state.userAddress, this.state.rdTokenContract)
                break;
            case ACCOUNT_BALANCE:
                const addrBal = this.getBalanceByAddress(this.state.userAddress, this.state.otherAddress, this.state.rdTokenContract);
                this.setState({
                    balanceAtAddress: addrBal
                })
                break;
            case TRANSFER:
                this.transferTokens(this.state.userAddress, this.state.otherAddress, this.state.rdTokenContract, this.state.rdTokenUnit);
                break;
            case APPROVE:
                this.approveAmount(this.state.userAddress, this.state.otherAddress, this.state.rdTokenContract, this.state.rdTokenUnit);
                break;
            case ALLOWANCE:
                this.getAllowance(this.state.userAddress, this.state.otherAddress, this.state.rdTokenContract);
                break;
            default:
                console.log('Nothing....')
                break;

        }
    }

    getAllowance = (userAddress, otherAddress, rdTokenContract) => {

        if (!userAddress || !otherAddress || !rdTokenContract) {
            console.error('Error in transferTokens, invalid parameters.')
            return
        }

        try {
            rdTokenContract
                .methods
                .allowance(userAddress, otherAddress)//Owner , spender
                .call({
                    from: userAddress,
                }).then(allowanceAmount => {
                    const convertedAllowance = amountFromToken(allowanceAmount, CONTRACT_DECIMALS)
                    console.log(`${userAddress} allowed to spend ${otherAddress} the amount of ${convertedAllowance} RDT`)
                    this.setState({
                        balanceAtAddress: `( ${convertedAllowance} RDT)`
                    })
                }).catch(err => console.error('Error during amount approvation :', err))

        } catch (error) {
            console.log('Generic error in the approve method : ', error)
        }

    }

    approveAmount = (userAddress, otherAddress, rdTokenContract, tokenAmount) => {

        if (!userAddress || !otherAddress || !rdTokenContract || !tokenAmount) {
            console.error('Error in transferTokens, invalid parameters.')
            return
        }

        const converted = amountToToken(tokenAmount, CONTRACT_DECIMALS)

        try {

            rdTokenContract
                .methods
                .approve(otherAddress, converted)
                .estimateGas({
                    from: userAddress
                }).then(gas => {

                    rdTokenContract
                        .methods
                        .approve(otherAddress, converted)
                        .send({
                            from: userAddress,
                            gas,
                            gasPrice: 200000000000,
                        }).then(res => {

                            if (res) {
                                console.log(`Approved ${converted} RDT for the address ${otherAddress}`);
                            } else {
                                console.error(`Error approving ${converted} RDT for the address ${otherAddress}`);
                            }

                        }).catch(err => console.error('Error during amount approvation :', err))

                }).catch(err => console.error('Error while estimating gas for approve method', err))

        } catch (error) {
            console.log('Generic error in the approve method : ', error)
        }

    }


    transferTokens = (userAddress, otherAddress, rdTokenContract, tokenAmount) => {

        if (!userAddress || !otherAddress || !rdTokenContract || !tokenAmount) {
            console.error('Error in transferTokens, invalid parameters.')
            return
        }

        try {
            const converted = amountToToken(tokenAmount, CONTRACT_DECIMALS)
            rdTokenContract
                .methods
                .transfer(otherAddress, converted).estimateGas({
                    from: userAddress,
                }).then(gas => {

                    console.log(`transferTokens gas estimation ${gas} for the token amount ${converted}`)
                    rdTokenContract
                        .methods
                        .transfer(otherAddress, converted)
                        .send({
                            from: userAddress,
                            gas,
                            gasPrice: 200000000000,
                        }).then(res => {
                            console.log(`Transferred ${tokenAmount} RDT from ${userAddress} to ${otherAddress} : `, res)
                            this.clearForm()
                        }).catch(err => console.error(`Error while invoking transferTokens : `, err))

                }).catch(err => console.error(`Error while invoking transferTokens gas estimation : `, err))

        } catch (error) {
            console.error('transferTokens, generic error : ', error)
        }

    }

    getBalanceByAddress = (userAddress, address, rdTokenContract) => {

        if (!userAddress || !address || !rdTokenContract) {
            console.error('Error in getTotalSuppy, invalid parameters.')
            return
        }

        try {

            rdTokenContract.methods
                .balanceOf(address)
                .call({ from: userAddress })
                .then(balance => {
                    const conv = amountFromToken(balance, CONTRACT_DECIMALS)
                    console.log(`The balance for the adddress ${address} is ${conv} RDT`)
                    this.setState({
                        balanceAtAddress: `( ${conv} RDT)`
                    })
                }).catch(err => console.error(`Error while invoking totalSupply : `, err))

            return 'gathering....'

        } catch (error) {
            console.error('getBalanceByAddress, generic error : ', error)
            return `${error}`
        }

    }

    getTotalSupply = (userAddress, rdTokenContract) => {

        if (!userAddress || !rdTokenContract) {
            console.error('Error in getTotalSuppy, on or more input parameter is invalid.')
            return 0
        }

        rdTokenContract
            .methods
            .totalSupply()
            .call({
                from: userAddress,
            }).then(res => {
                //Contract total supply is expressd in real units (e.g. 21.000.000 millions), that's why we need amountToToken
                console.log(`Total supply : ${amountToToken(res, CONTRACT_DECIMALS)}`)
                this.setState({
                    totalSupply: res,
                })
            }).catch(err => console.error(`Error while invoking totalSupply : `, err))

        return 0
    }

    isButtonDisabled = () => {
        return !this.state.otherAddress || !this.state.otherAddress.length || this.state.otherAddress === ""
    }

    changeOtherAddressHandle = (event) => {
        this.setState({
            otherAddress: event.target.value
        })
    }

    transferTokenHandle = (event) => {
        this.setState({
            rdTokenUnit: event.target.value
        })
    }

    render() {
        return (
            <article>
                <div className="RDToken">
                    <h3>RDToken {this.state.totalSupply}</h3>

                    <div className="RDToken-Form">

                        <div className="RDToken-Form-Elem">
                            <label>Address : </label>
                            <input type="text"
                                value={this.state.otherAddress}
                                onChange={this.changeOtherAddressHandle}
                            />
                            <label>{this.state.balanceAtAddress}</label>
                        </div>

                        <div className="RDToken-Form-Elem">
                            <label>RDToken units : </label>
                            <input type="number"
                                value={this.state.rdTokenUnit}
                                onChange={this.transferTokenHandle}
                                min="0"
                            />
                        </div>

                    </div>

                    <div className="RDToken-Operations">
                        <button onClick={() => this.onOperationClick(TOTAL_SUPPLY)}> Total Supply </button>

                        <button onClick={() => this.onOperationClick(ACCOUNT_BALANCE)}
                            disabled={this.isButtonDisabled()}> Find Balance </button>

                        <button onClick={() => this.onOperationClick(TRANSFER)}
                            disabled={this.isButtonDisabled()}> Transfer </button>

                        <button onClick={() => this.onOperationClick(APPROVE)}
                            disabled={this.isButtonDisabled()}> Approve </button>

                        <button onClick={() => this.onOperationClick(ALLOWANCE)}
                            disabled={this.isButtonDisabled()}> Allowance </button>

                        <button onClick={() => this.clearForm()}> Clear </button>
                    </div>
                </div>
            </article>
        );
    }

}

export function RDTokenDashboardBuilder(nextProps, userAddress, web3) {
    const storedContractAddress = getContractAddressFromStoreByName(RDTOKEN_CONTRACT_NAME)
    nextProps.selectedContractComponent = storedContractAddress ?
        <RDToken userAddress={userAddress}
            contractAddress={window.localStorage.getItem(RDTOKEN_CONTRACT_NAME)}
            json={RDTokenJSON}
            web3={web3} />
        : undefined;
    nextProps.selectedContractJSON = RDTokenJSON;
    nextProps.selectedContractName = RDTOKEN_CONTRACT_NAME;
    nextProps.selectedContractABI = RDTokenJSON.abi;
    nextProps.selectedContractBytecode = RDTokenJSON.bytecode;
    nextProps.selectedContractAddress = storedContractAddress ? storedContractAddress : "";
    return nextProps
}