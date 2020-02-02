import React from 'react';
import Web3Connector from '../../components/Web3Connector'
/* import Quiz from '../../components/Quiz'
 */
import Web3 from 'web3'
export default class BSMessage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authorized : false,
            web3 : undefined
        }
    }

    
    onAuthorization = (auth) => {
        this.setState({web3:new Web3(Web3.givenProvider)})
        this.setState({authorized: true})
        console.log('Contract ',this.state.web3.eth.Contract)
    }

    onDeploy = () => {
        const web3 = this.state.web3
    } 

    render() {
        return (
            <article>
                <p>Blockchain messages</p>
                <Web3Connector authorization={this.onAuthorization}/>
                <button onClick={this.onDeploy} disabled={!this.state.authorized}>Deploy the contract</button>
            </article>
        );
    }

}