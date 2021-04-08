const solc = require('solc');
const fs = require('fs-extra');
const path = require('path');


const contractPath = (rest) => {

    const result = path.resolve(
        process.cwd(), 'contracts', ...rest
    )
    return result
}

const findImports = (dependency) => {

    if(dependency) {
        return {contents: fs.readFileSync(
            contractPath([dependency]),
            'utf8'
        )}
    } else {
        return { error: 'File not found'}
    }
}

const compileERC721 = async () => {

    console.log("Started compilation");

    const input = {
        language: "Solidity",
        sources: {
            'ERC721.sol': {
                content: fs.readFileSync(
                    contractPath(['ERC721.sol']), 
                    'utf8'
                )
            }
        },
        settings: {
            outputSelection: {
            '*': {
                '*': ['*']
            }
            }
        }
    }

    const output = JSON.parse(
        solc.compile(JSON.stringify(input), { import: findImports })
    );

    // ABI = output.contracts['ERC721.sol'][contract-name].abi
    // Bytecode = output.contracts['ERC721.sol'][contract-name].evm.bytecode.object
    console.log("Finished compilation")
    return {
        abi: output.contracts['ERC721.sol']['ERC721'].abi,
        bytecode: output.contracts['ERC721.sol']['ERC721'].evm.bytecode.object
    }
}

module.exports = {
    compileERC721
}

// compileERC721()
// .then(() => process.exit(0))
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });
