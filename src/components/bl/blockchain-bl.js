const estimateGasCreation = (contractInstance, bytecode) => {
    return new Promise((resolve, reject) => {
        if (!contractInstance || !bytecode) {
            reject('No contract instance or bytecode given')
        }
        contractInstance.
            deploy({ data: bytecode }).
            estimateGas().then(gas => {
                resolve(gas)
            }).catch(err => {
                reject(err)
            })
    })
}

const deployContract = (web3, userAccount, contractBytecode, gasLimit, gasPrice) => {
    return new Promise((resolve, reject) => {
        web3.
            eth.
            sendTransaction({
                from: userAccount,
                to: 0,
                data: contractBytecode,
                gas: gasLimit,//GAS LIMIT, to estimate!
                gasPrice: gasPrice,
            }).then(data => {
                resolve(data)
            }).catch(err => {
                reject(err)
            })
    })
}

const ContractOperations = {
    estimateGasCreation,
    deployContract,
}

export default ContractOperations