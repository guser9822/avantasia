//CONSTS
import {
    SAVE_COMMAND,
    REMOVE_COMMAND,
} from '../common'

//Local Storage methods
export function getContractAddressFromStoreByName(contractName) {
    const contractAddress = window.localStorage.getItem(contractName.toUpperCase())
    return contractAddress !== 'null' &&
        contractAddress !== undefined &&
        contractAddress !== null
        ? contractAddress : undefined
}

export function getValuesFromLocalStorage(key) {
    const paramValue = window.localStorage.getItem(key)
    return paramValue !== 'null' &&
        paramValue !== undefined &&
        paramValue !== null
        ? paramValue : undefined
}

export function getValuesFromSessionStorage(key) {
    const paramValue = window.sessionStorage.getItem(key)
    return paramValue !== 'null' &&
        paramValue !== undefined &&
        paramValue !== null
        ? paramValue === 'true' ? true : paramValue === 'false' ? false : paramValue : undefined
}

export function persistConstructorParamsIntoLocalStorage(contractName, contractABI, paramValues, action) {

    if (!contractName ||
        !contractABI ||
        !contractABI.length ||
        (action === SAVE_COMMAND && (!paramValues || !paramValues.length))) {
        return;
    }

    const paramNames = getConstructorParamFromABI(contractABI);

    if (action === SAVE_COMMAND && paramNames.length !== paramValues.length) {
        console.error(`The number of parameters differs from the number of values`, paramNames, paramValues);
        return;
    }
    for (const [index, paramName] of paramNames.entries()) {
        switch (action) {
            case SAVE_COMMAND:
                window.localStorage.setItem(contractName + '.' + paramName, paramValues[index]);
                break;
            case REMOVE_COMMAND:
                window.localStorage.removeItem(contractName + '.' + paramName);
                break;
            default:
                console.error('Nothing...')
                break;
        }
    }
}

export function loadConstructorParamsFromLocalStorage(contractName, contractABI) {

    if (!contractName ||
        !contractABI ||
        !contractABI.length) {
        return []
    }

    const res = []
    const paramNames = getConstructorParamFromABI(contractABI);
    for (const paramName of paramNames) {
        const paramValue = getValuesFromLocalStorage(contractName + '.' + paramName)
        if (paramValue) {
            res.push(paramValue)
        }
    }
    return res;
}

export function getConstructorParamFromABI(contractABI) {

    if (!contractABI || !contractABI.length) {
        return []
    }

    const constructorObj = contractABI.find(it => it.type === 'constructor')
    if (!constructorObj) {
        return []
    }

    const constructorInputs = constructorObj.inputs
    if (!constructorInputs || !constructorInputs.length) {
        return []
    }

    return constructorInputs.map(it => it.name)
}

export function amountFromToken(amount, CONTRACT_DECIMALS) {
    if(! amount){
        return ``
    }
    let amt = amount;
    if (typeof amt === 'string' || amt instanceof String){
        amt = Number(amount)
    }
    return amt / Math.pow(10, CONTRACT_DECIMALS)
}

export function amountToToken(amount, CONTRACT_DECIMALS) {
    if(! amount){
        return ``
    }
    let amt = amount;
    if (typeof amt === 'string' || amt instanceof String){
        amt = Number(amount)
    }
    return amt * Math.pow(10, CONTRACT_DECIMALS)
}