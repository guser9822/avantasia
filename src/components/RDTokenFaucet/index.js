import React from 'react';
import RDTokenFaucetJSON from '../../bin/src/solc-src/RDTokenFaucet/RDTokenFaucet.json'
import { getContractAddressFromStoreByName } from '../bl/utility'
import Faucet from '../Faucet'

import {
    RDTOKEN_FAUCET_CONTRACT_NAME,
    _RDTokenContract,
    _RDTokenOwner,
} from '../common'

//Additional
import AdditionalsContainer from '../DashboardAdditionals/AdditionalsContainer'
import RDTokenFaucetAdditional from '../DashboardAdditionals/RDTokenFaucet'

export function RDTokenFaucetDashboardBuilder(nextProps, userAddress, web3) {
    const storedContractAddress = getContractAddressFromStoreByName(RDTOKEN_FAUCET_CONTRACT_NAME)
    nextProps.selectedContractComponent = storedContractAddress ?
        <Faucet userAddress={userAddress}
            contractAddress={window.localStorage.getItem(RDTOKEN_FAUCET_CONTRACT_NAME)}
            json={RDTokenFaucetJSON}
            web3={web3} />
        : undefined;
    nextProps.selectedContractJSON = RDTokenFaucetJSON;
    nextProps.selectedContractName = RDTOKEN_FAUCET_CONTRACT_NAME;
    nextProps.selectedContractABI = RDTokenFaucetJSON.abi;
    nextProps.selectedContractBytecode = RDTokenFaucetJSON.bytecode;
    nextProps.selectedContractAddress = storedContractAddress ? storedContractAddress : "";
    nextProps.constructorParamOrder = [_RDTokenContract, _RDTokenOwner];
    nextProps.constructorParamValidator = (params) => {
        return params.every(it => it && it.length && it !== '' && it !== "")
    }
    nextProps.additionalComponent = AdditionalsContainer(RDTokenFaucetAdditional, nextProps.constructorParamOrder)
    return nextProps
}