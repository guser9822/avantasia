import './BlockChainCC.css'
import React from 'react';
import Web3Connector from '../Web3Connector/index'

import Web3 from 'web3'

import FaucetJSON from '../../bin/src/solc-src/faucet/Faucet.json'
import Faucet from '../Faucet'
const FAUCET_CONTRACT_NAME = "faucet"


export default class BlockChainCC extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authorized: window.sessionStorage.getItem('authorized') ? true : false,
            web3: window.sessionStorage.getItem('authorized') ? new Web3(Web3.givenProvider) : undefined,
            contractName: "",
            contractAddress: "",
            userAddress: window.sessionStorage.getItem('userAddress'),
            selectedContractComponent: void undefined
        }
    }

    onAuthorization = (_userAddress) => {
        this.setState({
            web3: new Web3(Web3.givenProvider),
            authorized: true,
            userAddress: _userAddress[0],
        })
        window.sessionStorage.setItem('authorized', true)
        window.sessionStorage.setItem('userAddress', _userAddress[0])
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
    }

    onChangeContractAddress = (event) => {
        this.setState({
            contractAddress: event.target.value
        })
    }

    onLoadContractClick = () => {
        let selectedContractName = undefined
        const contractAddressInput = this.state.contractAddress
        const contrName = this.state.contractName

        if (contractAddressInput &&
            contractAddressInput.length &&
            contrName &&
            contrName.length) {
            window.localStorage.setItem(selectedContractName, contractAddressInput)
            console.log('Using contract address ' + contractAddressInput + ' for contract name ' + contrName)
        }

        if (contrName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            selectedContractName = FAUCET_CONTRACT_NAME
        }

        if (!selectedContractName) {
            console.log('Sorry, no contract with name ' + contrName + ' found')
            return
        }
        const foundContractAddress = window.localStorage.getItem(selectedContractName)
        const generatedComponent = this.selectContractComponent(foundContractAddress)
        this.setState({
            contractAddress: foundContractAddress,
            selectedContractComponent: generatedComponent,
        })
    }

    selectContractComponent = (contractAddress) => {
        const userAddr = this.state.userAddress
        const web3 = this.state.web3
        const contrName = this.state.contractName

        if (!contractAddress || !userAddr || !web3) {
            return
        }

        let selectedComponent = undefined
        if (contrName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            selectedComponent = <Faucet userAddress={userAddr}
                contractAddress={contractAddress}
                json={FaucetJSON}
                web3={web3}></Faucet>
        }
        return selectedComponent
    }

    disableOperationButton = () => {
        return !this.state.authorized || !this.state.contractName.length
    }

    onEstimationClick = () => {
        const contrName = this.state.contractName
        const contrAdress = this.state.contractAddress
        const userAddr = this.state.userAddress
        const web3 = this.state.web3
        if (!contrAdress) {
            console.log('Error, no contract address found ')
            return
        }

        let selectedContractABI = undefined
        if (contrName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            selectedContractABI = FaucetJSON.abi
        }

        if (!selectedContractABI) {
            console.log('Error, no contract ABI found for contract named ', contrName)
            return
        }

        const newContract = new web3.eth.Contract(selectedContractABI, contrAdress,
            {
                from: userAddr, // default from address
                gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
            });

        //1*10^4 = 10000000000000000 -> 0.0001 ether
        newContract.methods.withdraw(0). //TODO Error if withdraw > 0 , faucet is empty, refill 
            estimateGas({
                from: userAddr,
                gas: 5000000,
            }).
            then(gas => {
                console.log('GAS : ', gas)
            }).catch(err => {
                console.log('ERROR ', err)
            })

    }


    render() {
        const statusClass = this.state.authorized ? "Status-Block Connected" : "Status-Block Disconnected"
        return (
            <article>
                <div>
                    <div className="Intes-Block">
                        <h1> Ethereum dashboard </h1>
                        <div className={statusClass}></div>
                    </div>
                    <Web3Connector authorization={this.onAuthorization} />
                    <div className="ContractInfo-Block">
                        <label className="Descrpt-Label"> Contract info : Input name or address of the contract to operate on it</label>
                        <label>Name : </label>
                        <input disabled={!this.state.authorized} type="text" value={this.state.contractName} onChange={this.onChangeContractName}></input>
                        <label>Address : </label>
                        <input disabled={!this.state.authorized} type="text" value={this.state.contractAddress} onChange={this.onChangeContractAddress}></input>
                    </div>
                    <br />
                    <div className="ContractOperation-Block">
                        <button onClick={this.onEstimationClick} disabled={this.disableOperationButton()}>Estimate creation</button>
                        <button onClick={this.onDeployContractClick} disabled={this.disableOperationButton()}>Create the contract</button>
                        <button onClick={this.onLoadContractClick} disabled={this.disableOperationButton()}>Load latest version</button>
                    </div>
                </div>
                {this.state.selectedContractComponent}
            </article>
        );
    }

}