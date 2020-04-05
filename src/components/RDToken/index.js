import React from 'react';
import './RDToken.css'

const EHTER_UNIT_NAME = 'ether';
const DEFAULT_GAS_LIMIT = 5000000;

const TOTAL_SUPPLY = 'total_supply';
const ACCOUNT_BALANCE = 'account_balance';

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
        }
    }

    getBalanceByAddress = (userAddress, address, rdTokenContract) => {

        if (!userAddress || !address || !rdTokenContract) {
            console.error('Error in getTotalSuppy, on or more input parameter is invalid.')
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

    isBalanceButtonDisabled = () => {
        return !this.state.otherAddress || !this.state.otherAddress.length || this.state.otherAddress === ""
    }

    changeOtherAddressHandle = (event) => {
        this.setState({
            otherAddress: event.target.value
        })
    }

    render() {
        return (
            <article>
                <div className="RDToken">
                    <h3>RDToken {this.state.totalSupply}</h3>
                    <label>Address : </label>
                    <input type="text"
                        value={this.state.otherAddress}
                        onChange={this.changeOtherAddressHandle}
                    />
                    <label className="RDToken-Label">{this.state.balanceAtAddress}</label>
                    <div className="RDToken-Operations">
                        <button onClick={() => this.onOperationClick(TOTAL_SUPPLY)}> Total Supply </button>
                        <button onClick={() => this.onOperationClick(ACCOUNT_BALANCE)}
                            disabled={this.isBalanceButtonDisabled()}> Find Balance </button>
                    </div>
                </div>
            </article>
        );
    }

}