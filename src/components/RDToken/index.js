import React from 'react';
import './RDToken.css'

const EHTER_UNIT_NAME = 'ether';
const DEFAULT_GAS_LIMIT = 5000000

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
            rdTokenTotalSupply: undefined,
        }
    }

    onOperationClick = () => {
        console.log('Click')
    }

    render() {
        return (
            <article>
                <div className="RDToken">
                    <h3>RDToken Component {this.state.rdTokenTotalSupply}</h3>
                    <div className="RDToken-Operations">
                        <button onClick={() => this.onOperationClick()}>Total Supply</button>
                    </div>
                </div>
            </article>
        );
    }

}