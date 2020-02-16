import React from 'react';
import Web3Connector from '../../components/Web3Connector'
/* import Quiz from '../../components/Quiz'
 */
import Web3 from 'web3'
import FaucetJSON from '../../../bin/src/helloworld/Faucet.json'
export default class BSMessage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authorized: window.sessionStorage.getItem('authorized') ? true : false,
            web3: window.sessionStorage.getItem('authorized') ? new Web3(Web3.givenProvider) : undefined
        }
    }

    onAuthorization = (auth) => {
        this.setState({ web3: new Web3(Web3.givenProvider) })
        this.setState({ authorized: true })
        window.sessionStorage.setItem('authorized', this.state.authorized)
    }

    onDeployContractClick = () => {
        const web3 = this.state.web3
        web3.eth.getAccounts().then(accounts => {
            return accounts[0]
        }).then(userAccount => {
            this.deployContract('contract name', userAccount, FaucetJSON.bytecode)
        }).catch((err) => console.log(err))
    }

    deployContract = (contractName, userAccount, contactByteCode) => {
        const web3 = this.state.web3
        web3.
            eth.
            sendTransaction({
                from: userAccount,
                to: 0,
                data: contactByteCode,
                gas: 113558,//GAS LIMIT
                gasPrice: 200000000000,
            }).then(data => {
                console.log('Data ',data)
            }).catch(err => {
                console.error('Error ',err)
            })
    }

    render() {
        return (
            <article>
                <p>Blockchain messages</p>
                <Web3Connector authorization={this.onAuthorization} />
                <button onClick={this.onDeployContractClick} disabled={!this.state.authorized}>Deploy the contract</button>
            </article>
        );
    }

}