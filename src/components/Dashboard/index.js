import React from 'react';
import './Dashboard.css'

//LIB
import Web3 from 'web3'
import ContractOperations from '../bl/blockchain-bl'
import {
    persistConstructorParamsIntoLocalStorage,
} from '../bl/utility'

//Components
import Web3Connector from '../Web3Connector'
import Modal from '../Modal/index'
import DestroyModal from '../DestroyModal'
import { FaucetDashboardBuilder } from '../Faucet'
import { RDTokenDashboardBuilder } from '../RDToken'
import { RDTokenFaucetDashboardBuilder } from '../RDTokenFaucet'

//CONSTS
import {
    FAUCET_CONTRACT_NAME,
    RDTOKEN_CONTRACT_NAME,
    RDTOKEN_FAUCET_CONTRACT_NAME,
    SAVE_COMMAND,
    REMOVE_COMMAND,
} from '../common'


//MODALS
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
            ...this.initContractProps()
        }
    }

    initContractProps = () => {
        return {
            selectedContractComponent: undefined,
            selectedContractJSON: undefined,
            selectedContractName: undefined,
            selectedContractABI: undefined,
            selectedContractBytecode: undefined,
            selectedContractAddress: "",
            constructorParamOrder: [],
            constructorParamValidator: undefined,
            constructorParamValues: [],
            additionalComponent: undefined,
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
        web3.eth.getAccounts()
            .then(accounts => {
                return accounts[0]
            })
            .then(userAccount => {

                const loadedContract = this.getContractProps(this.state.contractName)
                if (!loadedContract) {
                    return
                }

                const contractInstance = new web3.eth.Contract(loadedContract.selectedContractABI, loadedContract.selectedContractAddress,
                    {
                        from: this.state.userAddress, // default from address
                        gasPrice: '20000000000',// default gas price in wei, 20 gwei in this case */
                    })
                const contractByecode = '0x' + loadedContract.selectedContractBytecode
                const constrParam = this.state.constructorParamValues
                const contractName = loadedContract.selectedContractName
                ContractOperations.estimateGasCreation(contractInstance, contractByecode, constrParam)
                    .then(gasEstimation => {

                        ContractOperations.deployContract(userAccount, contractInstance, contractByecode, gasEstimation, '20000000000', constrParam)
                            .then(data => {

                                console.log('data ', data)
                                console.log(`New contract ${contractName} deployed at address ${data.address} with a gas estimation price ${gasEstimation}`)
                                window.localStorage.setItem(contractName, data.address)

                                if (loadedContract.additionalComponent) {
                                    persistConstructorParamsIntoLocalStorage(contractName,
                                        data.jsonInterface,
                                        constrParam,
                                        SAVE_COMMAND)
                                }

                                this.setState({
                                    selectedContractAddress: data.address
                                })
                            }).catch(err => console.error('Error during contract creation and deploy : ', err))

                    }).catch(err => {
                        console.error('Error during contract gas estimation : ', err)
                    })

            }).catch((err) => console.log(err))
    }

    loadContractClickHandle = () => {

        const contractProps = this.getContractProps(this.state.contractName)
        if (!contractProps) {
            return
        }

        const { selectedContractAddress } = contractProps
        if (selectedContractAddress) {
            window.localStorage.setItem(contractProps.selectedContractName, contractProps.selectedContractAddress);
            console.log(`Using contract address ${contractProps.selectedContractAddress} for contract named ${contractProps.selectedContractName}`);
        }

        this.setState({
            ...contractProps
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
        const selContractName = contractProps.selectedContractName
        if (contractProps.selectedContractAddress !== contractAddress) {
            console.error(`Cannot destroy the contract at the address ${contractAddress} named ${selContractName} which is already bound to the contract at ${contractProps.selectedContractAddress}`)
            return
        }

        contractInstance = new this.state.web3.eth.Contract(contractProps.selectedContractABI, contractAddress,
            {
                from: this.state.userAddress, // default from address
                gasPrice: '20000000000',// default gas price in wei, 20 gwei in this case */
            })


        if (!contractInstance) {
            console.log(`Error while creating the instance for the contract ${selContractName} at address ${contractAddress}`)
            return
        }

        /**
         * Use send for deleting a contract, it will generate a transaction
         * (it will modify the contract state) and the owner will get back his
         * money
         * **/
        contractInstance.methods.destroy().send({
            from: this.state.userAddress,
            gas: 300000,//TODO GAS LIMIT, to estimate!
            gasPrice: 200000000000,
        })
            .then((res) => {

                if (contractProps.additionalComponent) {
                    persistConstructorParamsIntoLocalStorage(selContractName,
                        contractProps.selectedContractABI,
                        contractProps.constructorParamValues,
                        REMOVE_COMMAND)
                }

                window.localStorage.removeItem(selContractName)
                this.clearHandle()
                console.log(`Contract  ${selContractName} at  ${contractAddress} destroyed : `, res)
            })
            .catch((err) => {
                console.log(`Error destroiyng  ${selContractName} at  ${contractAddress} : `, err)
            })

    }

    getContractProps = (_contractName) => {

        if (!_contractName || !_contractName.length) {
            console.error(`Invalid contract name given in input.`)
            return
        }

        let error = true;
        let nextProps = this.initContractProps()
        const genContractName = _contractName.toUpperCase()

        switch (genContractName) {

            case FAUCET_CONTRACT_NAME:
                nextProps = FaucetDashboardBuilder(nextProps, this.state.userAddress, this.state.web3)
                error = false;
                break;

            case RDTOKEN_CONTRACT_NAME:
                nextProps = RDTokenDashboardBuilder(nextProps, this.state.userAddress, this.state.web3)
                error = false;
                break;

            case RDTOKEN_FAUCET_CONTRACT_NAME:
                nextProps = RDTokenFaucetDashboardBuilder(nextProps, this.state.userAddress, this.state.web3)
                error = false;
                break;

            default:
                console.log('Nothing....')
                break;
        }

        if (error) {
            console.error(`No contract found with name  ${_contractName}`)
            this.clearHandle()
            return
        }

        return {
            ...nextProps
        }
    }

    changeContractNameHandle = (event) => {
        this.setState({
            contractName: event.target.value
        })
    }

    disableOperationButton = (evaluateAdditionalFields) => {
        return !this.state.authorized ||
            !this.state.contractName.length ||
            (evaluateAdditionalFields &&
                this.state.additionalComponent &&
                !this.state.constructorParamValidator(this.state.constructorParamValues))
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

    clearHandle = () => {
        this.setState({
            ...this.initState()
        })
    }

    constructonParamsChangeHandle = (params) => {
        this.setState({
            constructorParamValues: [...params]
        })
    }

    render() {

        const statusClass = this.state.authorized ? "Status-Block Connected" : "Status-Block Disconnected"
        const ContractAdditional = this.state.additionalComponent ? this.state.additionalComponent : undefined

        return (
            <article>
                <div>
                    <div className="Intes-Block">
                        <h1> Ethereum dashboard </h1>
                        <div className={statusClass}></div>
                    </div>

                    <Web3Connector authorization={this.authorizationHandle} />

                    <div className="ContractInfo-Block">

                        <label className="Descrpt-Label">Write the name of the contract to operate on it</label>
                        <label>Name : </label>

                        <input disabled={!this.state.authorized}
                            type="text"
                            value={this.state.contractName}
                            onChange={this.changeContractNameHandle} />
                        <label>Address : </label>

                        <input disabled={!this.state.authorized}
                            type="text"
                            value={this.state.selectedContractAddress}
                            readOnly
                        />

                        {
                            ContractAdditional ?
                                <div className="Dashboard-ConstructorParams">
                                    <h4>Contract additional parameters </h4>
                                    <ContractAdditional onParamsChange={this.constructonParamsChangeHandle} />
                                </div> : undefined
                        }

                        <div className="ContractOperation-Block">

                            <button onClick={this.deployContractClickHandle}
                                disabled={this.disableOperationButton(true)}>Create the contract</button>

                            <button onClick={this.loadContractClickHandle}
                                disabled={this.disableOperationButton(false)}>Load latest version</button>

                            <button onClick={this.destroyClickHandle}
                                disabled={this.disableOperationButton(false)}>Destroy a contract</button>

                            <button onClick={this.clearHandle}
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