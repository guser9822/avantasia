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
            contractAddress: undefined,
            userAddress: window.sessionStorage.getItem('userAddress') 
        }
    }

    onAuthorization = (_userAddress) => {
        this.setState({
            web3: new Web3(Web3.givenProvider) ,
            authorized: true,
            userAddress: _userAddress[0],
        })
        window.sessionStorage.setItem('authorized', true)
        window.sessionStorage.setItem('userAddress',_userAddress[0])
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
        const contrAdress = this.state.contractAddress
        const userAddr = this.state.userAddress
        const web3 = this.state.web3
        if(!contrAdress ){
            console.log('Error, no contract address found ')
            return
        }

        let selectedContractABI = undefined
        if (contrName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            selectedContractABI = FaucetJSON.abi
        }

        if( ! selectedContractABI){
            console.log('Error, no contract ABI found for contract named ', contrName)
            return
        }
        console.log('web3 ',web3)
        var contract = web3.eth.contract(selectedContractABI).at(contrAdress);
        var gasEstimate = contract.withdraw.estimateGas(web3.utils.toWei(0.1, "ether"));
        console.log('gas estimation : ', gasEstimate)
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