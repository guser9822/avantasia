import React from 'react';
import Web3Connector from '../../components/Web3Connector'


import Web3 from 'web3'

import FaucetJSON from '../../../bin/src/helloworld/Faucet.json'
import Faucet from '../../containers/Faucet'
const FAUCET_CONTRACT_NAME = "faucet"


export default class BlockChainCC extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authorized: window.sessionStorage.getItem('authorized') ? true : false,
            web3: window.sessionStorage.getItem('authorized') ? new Web3(Web3.givenProvider) : undefined,
            contractName: "",
            contractAddress: undefined
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
            const contrName = this.state.contractName
            let selecteContractJSON = undefined
            let selectedContractName = undefined

            if (contrName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
                selecteContractJSON = FaucetJSON
                selectedContractName = FAUCET_CONTRACT_NAME
            }

            if (!selecteContractJSON) {
                console.log('Error, no contract found with name : ', contrName)
                return
            }

            this.deployContract(selectedContractName, userAccount, selecteContractJSON.bytecode)
        }).catch((err) => console.log(err))
    }

    deployContract = (selectedContractName, userAccount, contactByteCode) => {

        const web3 = this.state.web3
        web3.
            eth.
            sendTransaction({
                from: userAccount,
                to: 0,
                data: contactByteCode,
                gas: 300000,//GAS LIMIT, to estimate!
                gasPrice: 200000000000,
            }).then(data => {
                window.localStorage.setItem(selectedContractName, data.contractAddress)
            }).catch(err => {
                console.error('Error ', err)
            })
    }

    onChangeContractName = (event) => {
        this.setState({
            contractName: event.target.value
        })
        this.setState({
            contractAddress: window.localStorage.getItem(event.target.value)
        })
    }

    onLoadContractClick = () => {
        let selectedContractName = undefined
        const contrName = this.state.contractName
        if (contrName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            selectedContractName = FAUCET_CONTRACT_NAME
        }

        console.log(window.localStorage.getItem(selectedContractName))
        this.setState({
            contractAddress: window.localStorage.getItem(selectedContractName)
        })
    }

    disableOperationButton = () => {
        return !this.state.authorized || !this.state.contractName.length
    }

    selectContractComponent = () => {
        const contractAddress = this.state.contractAddress
        if (! contractAddress) {
            return
        }

        let selectedComponent = undefined
        const contrName = this.state.contractName
        if (contrName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            selectedComponent = <Faucet address={contractAddress}></Faucet>
        }
        return selectedComponent
    }

    onEstimationClick = () => {
        const contrName = this.state.contractName

        if(! this.state.contractAddress){
            console.log('Error, no contract address found ')
            return
        }

        let selectedContractABI = undefined
        if (contrName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            selectedContractABI = FaucetABI
        }

        if( ! selectedContractABI){
            console.log('Error, no contract ABI found for contract named ', contrName)
            return
        }
        
        console.log('ABI :', selectedContractABI)
        //var contract = web3.eth.contract(abi).at(address);

    }


    readFile = () => {
        var openFile = function(event) {
            var input = event.target;
    
            var reader = new FileReader();
            reader.onload = function(){
              var text = reader.result;
              var node = document.getElementById('output');
              node.innerText = text;
              console.log(reader.result.substring(0, 200));
            };
            reader.readAsText(input.files[0]);
          };
    }

    render() {

        const contractComponent = this.selectContractComponent()

        return (
            <article>
                <div>
                    <p>Ethereum dashboard : </p>
                    <Web3Connector authorization={this.onAuthorization} />
                    <label>Contract name : </label>
                    <input type="text" value={this.state.contractName} onChange={this.onChangeContractName}></input>
                    <br />
                    <label>Select the operation : </label>
                    <button onClick={this.onEstimationClick} disabled={this.disableOperationButton()}>Estimate creation</button>
                    <button onClick={this.onDeployContractClick} disabled={this.disableOperationButton()}>Create the contract</button>
                    <button onClick={this.onLoadContractClick} disabled={this.disableOperationButton()}>Load latest version</button>
                    <br />
                    <br />
                </div>
                {contractComponent}
            </article>
        );
    }

}