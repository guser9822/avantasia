import React from 'react';
import './RDToken.css'

const EHTER_UNIT_NAME = 'ether';
const DEFAULT_GAS_LIMIT = 5000000

const TOTAL_SUPPLY = 'total_supply'
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
        }
    }

    onOperationClick = (operation) => {

        switch (operation) {
            case TOTAL_SUPPLY:
                console.log('Click')
                this.getTotalSupply(this.state.userAddress, this.state.rdTokenContract)
                break
        }
    }

    getTotalSupply = (userAddress, rdTokenContract) => {

        if (!userAddress) {
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
        })
            .catch(err => console.error(`Error while invoking totalSupply : `, err))

        return '...gathering'
    }

    render() {
        return (
            <article>
                <div className="RDToken">
                    <h3>RDToken {this.state.totalSupply}</h3>
                    <div className="RDToken-Operations">
                        <button onClick={() => this.onOperationClick(TOTAL_SUPPLY)}>Total Supply</button>
                    </div>
                </div>
            </article>
        );
    }

}