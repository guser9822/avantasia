const estimateGasCreation = (contractInstance, bytecode, constructorParams) => {
    return new Promise((resolve, reject) => {
        if (!contractInstance || !bytecode) {
            reject('No contract instance or bytecode given')
        }

        const input = {
            data: bytecode
        }

        if (constructorParams && constructorParams.length) {
            input.arguments = [...constructorParams]
        }

        contractInstance
            .deploy(input)
            .estimateGas()
            .then(gas => {
                resolve(gas)
            }).catch(err => {
                reject(err)
            })
    })
}

const deployContract = (
    userAccount,
    contractInstance,
    contractBytecode,
    gasLimit,
    gasPrice,
    constructorParams) => {

    return new Promise((resolve, reject) => {

        let input = {
            data: contractBytecode
        }

        if (constructorParams && constructorParams.length) {
            input.arguments = [...constructorParams]
        }

        contractInstance
            .deploy(input)
            .send({
                from: userAccount,
                gas: gasLimit,
                gasPrice,
            })
            .then(res => {

                const data = {
                    ...res.options
                }
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })

    })

}

const ContractOperations = {
    estimateGasCreation,
    deployContract,
}

export default ContractOperations