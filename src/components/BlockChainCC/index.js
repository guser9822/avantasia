import './BlockChainCC.css'
import React from 'react';
import Web3Connector from '../Web3Connector/index'
import Modal from '../Modal/index'
import Web3 from 'web3'
import DestroyModal from '../DestroyModal/index'

import FaucetJSON from '../../bin/src/solc-src/faucet/Faucet.json'
import Faucet from '../Faucet'
const FAUCET_CONTRACT_NAME = "faucet"

const DestroyContractModal = Modal(DestroyModal)
export default class BlockChainCC extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authorized: window.sessionStorage.getItem('authorized') ? true : false,
            web3: window.sessionStorage.getItem('authorized') ? new Web3(Web3.givenProvider) : undefined,
            contractName: "",
            contractAddress: "",
            userAddress: window.sessionStorage.getItem('userAddress'),
            selectedContractComponent: void undefined,
            selecteContractJSON: undefined,
            selectedContractName: undefined,
            selectedContractABI: undefined,
            selectedContractBytecode: undefined,
            selectedContractAddress: "",
            showDestroyModal: false,
        }
    }

    authorizationHandle = (_userAddress) => {
        this.setState({
            web3: new Web3(Web3.givenProvider),
            authorized: true,
            userAddress: _userAddress[0],
        })
        window.sessionStorage.setItem('authorized', true)
        window.sessionStorage.setItem('userAddress', _userAddress[0])
    }

    switchContract = (contractName) => {

        if (!contractName || !contractName.length) {
            console.error('Invalid contract name given in input.')
            return
        }
        let ok = false
        if (contractName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            this.setState({
                selectedContractComponent: <Faucet userAddress={this.state.userAddress}
                    contractAddress={window.localStorage.getItem(FAUCET_CONTRACT_NAME)}
                    json={FaucetJSON}
                    web3={this.state.web3}></Faucet>,
                selecteContractJSON: FaucetJSON,
                selectedContractName: FAUCET_CONTRACT_NAME,
                selectedContractABI: FaucetJSON.abi,
                selectedContractBytecode: FaucetJSON.bytecode,
                selectedContractAddress: window.localStorage.getItem(FAUCET_CONTRACT_NAME),
                contractAddress: window.localStorage.getItem(FAUCET_CONTRACT_NAME),
            })
            ok = true;
        }

        if (!ok) {
            console.error('No contract found with name ', contractName)
        }

        return ok
    }

    deployContractClickHandle = () => {
        const web3 = this.state.web3
        web3.eth.getAccounts().then(accounts => {
            return accounts[0]
        }).then(userAccount => {

            if (!this.switchContract(this.state.contractName)) {
                return
            }

            this.deployContract(this.state.selectedContractName, userAccount, this.state.selectedContractBytecode)
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

    changeContractNameHandle = (event) => {
        this.setState({
            contractName: event.target.value
        })
    }

    changeContractAddressHandle = (event) => {
        this.setState({
            contractAddress: event.target.value
        })
    }

    loadContractClickHandle = () => {

        if (!this.switchContract(this.state.contractName)) {
            return
        }

        window.localStorage.setItem(this.state.selectedContractName, this.state.selectedContractAddress)
        console.log('Using contract address ' + this.state.contractAddress + ' for contract name ' + this.state.contractName)
    }

    disableOperationButton = () => {
        return !this.state.authorized || !this.state.contractName.length
    }

    isAuthorized = () => {
        return this.state.authorized
    }

    estimationClickHandle = () => {
        const contrName = this.state.contractName
        const contrAdress = this.state.contractAddress
        const userAddr = this.state.userAddress
        const web3 = this.state.web3
        if (!contrAdress) {
            console.log('Error, no contract address found ')
            return
        }

        let selectedContractABI = undefined
        let selectedContractBytecode = undefined
        if (contrName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            selectedContractABI = FaucetJSON.abi
            selectedContractBytecode = '0x' + FaucetJSON.bytecode
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

        newContract.
            deploy({ data: selectedContractBytecode }).
            estimateGas().then(gas => {
                console.log('GAS : ', gas)
            }).catch(err => {
                console.log('ERROR ', err)
            })
        //console.log('Contract data ', newContract)
        //1*10^4 = 10000000000000000 -> 0.0001 ether
        /*         newContract.methods.withdraw(100). //TODO Error if withdraw > 0 , faucet is empty, refill 
                    estimateGas({
                        from: userAddr,
                        gas: 5000000,
                    }).
                    then(gas => {
                        console.log('GAS : ', gas)
                    }).catch(err => {
                        console.log('ERROR ', err)
                    }) */

    }

    destroyClickHandle = () => {
        const showDestroyState = !this.state.showDestroyModal
        this.setState({ showDestroyModal: showDestroyState })
    }

    destroyCancelClickCancel = () => {
        this.setState({ showDestroyModal: false })
    }

    destroyConfirmClickHandle = (params) => {
        this.setState({ showDestroyModal: false })
        const web3 = this.state.web3
        const userAddress = this.state.userAddress
        const contractName = params[0]
        const contractAddress = params[1]

        let selectedContractABI = undefined
        let contractInstance = undefined
        if (contractName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {
            selectedContractABI = FaucetJSON.abi

            if (!selectedContractABI) {
                console.log('Error, no abi found for contract with name ', contractName)
            }

            contractInstance = new web3.eth.Contract(selectedContractABI, contractAddress,
                {
                    from: userAddress, // default from address
                    gasPrice: '20000000000',// default gas price in wei, 20 gwei in this case */
                })
        }

        if (!contractInstance) {
            console.log('Error, no instance created for contract ', contractName)
        }

        /**
         * Use send for deleting a contract, it will generate a transaction
         * (it will modofy the contract state) and the owner will get back his
         * money
         * **/
        contractInstance.methods.destroy().send({
            from: userAddress,
            gas: 300000,//TODO GAS LIMIT, to estimate!
            gasPrice: 200000000000,
        }).
            then((res) => {
                console.log('Contract ' + contractName + ' at ' + contractAddress + ' destroyed!')
                console.log('Resp ', res)
            }).
            catch((err) => {
                console.log('Error destroiyng ' + contractName + ' at ' + contractAddress + ': ' + err)
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
                    <Web3Connector authorization={this.authorizationHandle} />
                    <div className="ContractInfo-Block">
                        <label className="Descrpt-Label"> Contract info : Input name or address of the contract to operate on it</label>
                        <label>Name : </label>
                        <input disabled={!this.state.authorized} type="text" value={this.state.contractName} onChange={this.changeContractNameHandle} />
                        <label>Address : </label>
                        <input disabled={!this.state.authorized} type="text" value={this.state.contractAddress} onChange={this.changeContractAddressHandle} />
                    </div>
                    <br />
                    <div className="ContractOperation-Block">
                        <button onClick={this.estimationClickHandle} disabled={this.disableOperationButton()}>Estimate creation</button>
                        <button onClick={this.deployContractClickHandle} disabled={this.disableOperationButton()}>Create the contract</button>
                        <button onClick={this.loadContractClickHandle} disabled={this.disableOperationButton()}>Load latest version</button>
                        <button onClick={this.destroyClickHandle} disabled={!this.isAuthorized}>Destroy a contract</button>
                    </div>
                </div>
                {this.state.selectedContractComponent}
                <DestroyContractModal
                    showModal={this.state.showDestroyModal}
                    onCancel={this.destroyCancelClickCancel}
                    onConfirm={this.destroyConfirmClickHandle}
                />
            </article>
        );
    }

}