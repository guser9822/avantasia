import './Dashboard.css'
import React from 'react';
import Web3Connector from '../Web3Connector/index'
import Modal from '../Modal/index'
import Web3 from 'web3'
import DestroyModal from '../DestroyModal/index'
import ContractOperations from '../bl/blockchain-bl'
import FaucetJSON from '../../bin/src/solc-src/faucet/Faucet.json'
import Faucet from '../Faucet'
const FAUCET_CONTRACT_NAME = "faucet"

const DestroyContractModal = Modal(DestroyModal)
export default class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authorized: window.sessionStorage.getItem('authorized') ? true : false,
            web3: window.sessionStorage.getItem('authorized') ? new Web3(Web3.givenProvider) : undefined,
            userAddress: window.sessionStorage.getItem('userAddress'),
            showDestroyModal: false,
            ...this.initState()
        }
    }

    initState = () => {
        return {
            contractName: "",
            contractAddress: "",
            selectedContractComponent: undefined,
            selectedContractJSON: undefined,
            selectedContractName: undefined,
            selectedContractABI: undefined,
            selectedContractBytecode: undefined,
            selectedContractAddress: "",
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

    deployContractClickHandle = () => {
        const web3 = this.state.web3
        web3.eth.getAccounts().then(accounts => {
            return accounts[0]
        }).then(userAccount => {

            const loadedContract = this.getContractProps(this.state.contractName)
            if (!loadedContract) {
                return
            }

            const contractInstance = new web3.eth.Contract(loadedContract.selectedContractABI, loadedContract.contractAddress,
                {
                    from: this.state.userAddress, // default from address
                    gasPrice: '20000000000',// default gas price in wei, 20 gwei in this case */
                })
            const contractByecode = '0x' + loadedContract.selectedContractBytecode

            ContractOperations.estimateGasCreation(contractInstance, contractByecode).
                then(gasEstimation => {

                    ContractOperations.deployContract(web3, userAccount, contractByecode, gasEstimation, '20000000000').
                        then(data => {

                            console.log(`New contract ${loadedContract.selectedContractName} deployed at address ${data.contractAddress} with a gas estimation price ${gasEstimation}`)
                            window.localStorage.setItem(loadedContract.selectedContractName, data.contractAddress)

                        }).catch(err => console.error('Error during contract creation and deploy : ', err))

                }).catch(err => console.error('Error during contract gas estimation : ', err))

        }).catch((err) => console.log(err))
    }

    deployContract = (selectedContractName, userAccount, contactByteCode) => {

        this.state.web3.
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
                console.log(`ERROR : `, err)
            })
    }

    loadContractClickHandle = () => {

        const contractProps = this.getContractProps(this.state.contractName)
        if (!contractProps) {
            return
        }

        window.localStorage.setItem(contractProps.selectedContractName, contractProps.selectedContractAddress)
        console.log(`Using contract address ${contractProps.contractAddress} for contract named  ${contractProps.selectedContractName}`)
        this.setState({
            ...contractProps
        })
    }

    estimateCreationClickHandle = () => {

        const contractProps = this.getContractProps(this.state.contractName)
        if (!contractProps) {
            console.error(`Cannot estimate creation for the contract named ${this.state.contractName}`)
            return
        }

        const newContract = new this.state.web3.eth.Contract(contractProps.selectedContractABI, contractProps.selectedContractAddress,
            {
                from: this.state.userAddress, // default from address
                gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
            });
        const byteCode = '0x' + contractProps.selectedContractBytecode
        newContract.
            deploy({ data: byteCode }).
            estimateGas().then(gas => {
                console.log(`GAS : ${gas}`)
            }).catch(err => {
                console.log(`ERROR : `, err)
            })
    }

    destroyConfirmClickHandle = (params) => {
        this.setState({ showDestroyModal: false })
        const contractName = params[0]
        const contractAddress = params[1]

        let contractInstance = undefined
        const contractProps = this.getContractProps(contractName)

        if (!contractProps) {
            console.error(`Cannot estimate creation for the contract named ${contractName}`)
            return
        }

        if (contractProps.selectedContractAddress !== contractAddress) {
            console.error(`Cannot destroy the contract at the address ${contractAddress} named ${contractName} which is already bound to the contract at ${contractProps.selectedContractAddress}`)
            return
        }

        contractInstance = new this.state.web3.eth.Contract(contractProps.selectedContractABI, contractAddress,
            {
                from: this.state.userAddress, // default from address
                gasPrice: '20000000000',// default gas price in wei, 20 gwei in this case */
            })


        if (!contractInstance) {
            console.log(`Error while creating the instance for the contract ${contractName} at address ${contractAddress}`)
            return
        }

        /**
         * Use send for deleting a contract, it will generate a transaction
         * (it will modofy the contract state) and the owner will get back his
         * money
         * **/
        contractInstance.methods.destroy().send({
            from: this.state.userAddress,
            gas: 300000,//TODO GAS LIMIT, to estimate!
            gasPrice: 200000000000,
        }).
            then((res) => {
                console.log(`Contract  ${contractName} at  ${contractAddress} destroyed : `, res)
            }).
            catch((err) => {
                console.log(`Error destroiyng  ${contractName} at  ${contractAddress} : `, err)
            })

    }

    getContractProps = (_contractName) => {

        if (!_contractName || !_contractName.length) {
            console.error(`Invalid contract name given in input.`)
            return
        }

        let ok = false;
        let component = undefined;
        let contractJSON = undefined;
        let contractName = undefined;
        let contractABI = undefined;
        let contractBytecode = undefined;
        let selContractAddress = undefined;
        let contractAddress = undefined;

        if (_contractName.toUpperCase().includes(FAUCET_CONTRACT_NAME.toUpperCase())) {

            component = <Faucet userAddress={this.state.userAddress}
                contractAddress={window.localStorage.getItem(FAUCET_CONTRACT_NAME)}
                json={FaucetJSON}
                web3={this.state.web3}></Faucet>;
            contractJSON = FaucetJSON;
            contractName = FAUCET_CONTRACT_NAME;
            contractABI = FaucetJSON.abi;
            contractBytecode = FaucetJSON.bytecode;
            selContractAddress = window.localStorage.getItem(FAUCET_CONTRACT_NAME);
            contractAddress = window.localStorage.getItem(FAUCET_CONTRACT_NAME);
            ok = true;
        }

        if (!ok) {
            console.error(`No contract found with name  ${_contractName}`)
            return
        }

        return {
            selectedContractComponent: component,
            selectedContractJSON: contractJSON,
            selectedContractName: contractName,
            selectedContractABI: contractABI,
            selectedContractBytecode: contractBytecode,
            selectedContractAddress: selContractAddress,
            contractAddress: contractAddress,
        }
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

    disableOperationButton = () => {
        return !this.state.authorized || !this.state.contractName.length
    }

    isAuthorized = () => {
        return this.state.authorized
    }

    isContractLoaded = () => {
        return this.state.contractLoaded
    }

    destroyClickHandle = () => {
        const showDestroyState = !this.state.showDestroyModal
        this.setState({ showDestroyModal: showDestroyState })
    }

    destroyCancelClickCancel = () => {
        this.setState({ showDestroyModal: false })
    }

    clearClickHandle = () => {
        this.setState({
            ...this.initState()
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
                        <input disabled={!this.state.authorized}
                            type="text"
                            value={this.state.contractName}
                            onChange={this.changeContractNameHandle} />
                        <label>Address : </label>
                        <input disabled={!this.state.authorized}
                            type="text"
                            value={this.state.contractAddress}
                            onChange={this.changeContractAddressHandle} />
                        <div className="ContractOperation-Block">
                            <button onClick={this.estimateCreationClickHandle}
                                disabled={this.disableOperationButton()}>Estimate creation</button>
                            <button onClick={this.deployContractClickHandle}
                                disabled={this.disableOperationButton()}>Create the contract</button>
                            <button onClick={this.loadContractClickHandle}
                                disabled={this.disableOperationButton()}>Load latest version</button>
                            <button onClick={this.destroyClickHandle}
                                disabled={!this.isAuthorized} disabled={this.disableOperationButton()}>Destroy a contract</button>
                            <button onClick={this.clearClickHandle}
                                disabled={!this.isAuthorized}>Clear</button>
                        </div>
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