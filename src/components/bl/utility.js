export function getContractAddressFromStoreByName (contractName) {
    const contractAddress = window.localStorage.getItem(contractName.toUpperCase())
    return contractAddress !== 'null' &&
        contractAddress !== undefined &&
        contractAddress !== null
        ? contractAddress : undefined
}