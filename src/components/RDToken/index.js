import React from 'react';
import './RDToken.css'

const EHTER_UNIT_NAME = 'ether';
const DEFAULT_GAS_LIMIT = 5000000;

const TOTAL_SUPPLY = 'total_supply';
const ACCOUNT_BALANCE = 'account_balance';
const TRANSFER = 'transfer';

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

    onOperationClick = (operation) => {

        switch (operation) {
            case TOTAL_SUPPLY:
                const totSupply = this.getTotalSupply(this.state.userAddress, this.state.rdTokenContract)
                this.setState({
                    totalSupply: totSupply
                })
                break
            case ACCOUNT_BALANCE:
                const addrBal = this.getBalanceByAddress(this.state.userAddress, this.state.otherAddress, this.state.rdTokenContract);
                this.setState({
                    balanceAtAddress: addrBal
                })
                break
            case TRANSFER:
                this.transferTokens(this.state.userAddress, this.state.otherAddress, this.state.rdTokenContract, this.state.rdTokenUnit);
                break
        }
    }

    transferTokens = (userAddress, otherAddress, rdTokenContract, tokenAmount) => {

        if (!userAddress || !otherAddress || !rdTokenContract || !tokenAmount) {
            console.error('Error in transferTokens, invalid parameters.')
            return
        }

        try {
            console.log(rdTokenContract)
            rdTokenContract
                .methods
                .transfer(otherAddress, tokenAmount).estimateGas({
                    from: userAddress,
                }).then(gas => {

                    console.log(`transferTokens gas estimation ${gas}`)

                    rdTokenContract.
                        methods
                        .transfer(otherAddress, tokenAmount)
                        .send({
                            from: userAddress,
                            gas,
                            gasPrice: 200000000000,
                        }).then(res => {
                            console.log(`Transferred ${tokenAmount} RDT from ${userAddress} to ${otherAddress} : `, res)
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

            rdTokenContract.methods.
                balanceOf(address)
                .call({ from: userAddress })
                .then(balance => {
                    console.log(`The balance for the adddress ${address} is ${balance} RDT`)
                    this.setState({
                        balanceAtAddress: `( ${balance} RDT)`
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
            return
        }

        rdTokenContract.methods.totalSupply().call({
            from: userAddress,
        }).then(res => {
            console.log(`Total supply : `, res)
            this.setState({
                totalSupply: `( ${res} RDT )`
            })
            return res
        }).catch(err => console.error(`Error while invoking totalSupply : `, err))

        return '...gathering'
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
                    </div>
                </div>
            </article>
        );
    }

}