import React from 'react';
import './Web3Connector.css'

//LIB
import Web3 from 'web3'

export default class Web3Connector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            web3: undefined,
            authorized: window.sessionStorage.getItem('authorized') ? true : false,
        };
    }

    onClickConnect = () => {
        const neWeb3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));//Parity node
        this.setState({
            web3: neWeb3,
            authorized: true,
        })

        neWeb3
            .eth
            .getAccounts()
            .then(res => {

                this.props.authorization({
                    web3: neWeb3,
                    userAddress: res[0],
                })

            })
            .catch(err => {
                console.error('Error while connecting : ', err)
            });
    }

    render() {
        const showButton = !this.state.authorized ?
            <button onClick={this.onClickConnect}
                disabled={this.state.authorized}
            >Connect</button> : void undefined
        return (
            <article>
                <div className="Connect-Button">
                    {showButton}
                </div>
            </article>
        );
    }

}