import React from 'react';
import RDTokenFaucetJSON from '../../bin/src/solc-src/RDTokenFaucet/RDTokenFaucet.json'
import {
    getContractAddressFromStoreByName,
    getConstructorParamFromABI,
    loadConstructorParamsFromLocalStorage,
    amountFromToken,
    amountToToken,
} from '../bl/utility'
import Faucet from '../Faucet'

import {
    RDTOKEN_FAUCET_CONTRACT_NAME,
} from '../common'

//Additional
import AdditionalsContainer from '../DashboardAdditionals/AdditionalsContainer'
import RDTokenFaucetAdditional from '../DashboardAdditionals/RDTokenFaucet'
const CONTRACT_DECIMALS = 2

export function RDTokenFaucetDashboardBuilder(nextProps, userAddress, web3) {
    const storedContractAddress = getContractAddressFromStoreByName(RDTOKEN_FAUCET_CONTRACT_NAME);
    nextProps.selectedContractComponent = storedContractAddress ?
        <Faucet
            title="RDToken Faucet"
            userAddress={userAddress}
            contractName={RDTOKEN_FAUCET_CONTRACT_NAME}
            contractAddress={window.localStorage.getItem(RDTOKEN_FAUCET_CONTRACT_NAME)}
            json={RDTokenFaucetJSON}
            web3={web3}
            balanceGetterConverter={(val) => '( ' + amountFromToken(val, CONTRACT_DECIMALS) + ' RDT )'}
            withdrawValueConverter={(amount) => amountToToken(amount, CONTRACT_DECIMALS)}
        />
        : undefined;
    nextProps.selectedContractJSON = RDTokenFaucetJSON;
    nextProps.selectedContractName = RDTOKEN_FAUCET_CONTRACT_NAME;
    nextProps.selectedContractABI = RDTokenFaucetJSON.abi;
    nextProps.selectedContractBytecode = RDTokenFaucetJSON.bytecode;
    nextProps.selectedContractAddress = storedContractAddress ? storedContractAddress : "";
    nextProps.constructorParamOrder = getConstructorParamFromABI(RDTokenFaucetJSON.abi);
    nextProps.constructorParamValidator = (params) => {
        return params.every(it => it && it.length && it !== '' && it !== "")
    }

    const constrParamValues = loadConstructorParamsFromLocalStorage(RDTOKEN_FAUCET_CONTRACT_NAME, RDTokenFaucetJSON.abi);
    nextProps.constructorParamValues = [...constrParamValues]

    nextProps.additionalComponent = AdditionalsContainer(RDTokenFaucetAdditional, nextProps.constructorParamOrder, RDTOKEN_FAUCET_CONTRACT_NAME)
    return nextProps
}