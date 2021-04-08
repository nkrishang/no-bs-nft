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

    const dep =  dependency.split("/");

    if(dependency.includes("extensions")) {
        return {contents: fs.readFileSync(
            contractPath(['ERC721', 'extensions', dep[dep.length - 1]]),
            'utf8'
        )}
    } else if(dependency.includes("presets")) {
        return {contents: fs.readFileSync(
            contractPath(['ERC721', 'presets', dep[dep.length - 1]]),
            'utf8'
        )}
    } else if(dependency.includes("introspection")) {
        return {contents: fs.readFileSync(
            contractPath(['utils', 'introspection', dep[dep.length - 1]]),
            'utf8'
        )}
    } else if(dependency.includes("structs")) {
        return {contents: fs.readFileSync(
            contractPath(['utils', 'structs', dep[dep.length - 1]]),
            'utf8'
        )}
    } else if(dependency.includes("utils")) {
        return {contents: fs.readFileSync(
            contractPath(['utils', dep[dep.length - 1]]),
            'utf8'
        )}
    } else if(dependency.includes("access")) {
        return {contents: fs.readFileSync(
            contractPath(['access', dep[dep.length - 1]]),
            'utf8'
        )}
    } else if(dependency.includes("security")) {
        return {contents: fs.readFileSync(
            contractPath(['security', dep[dep.length - 1]]),
            'utf8'
        )}
    }  else if(dependency.includes("ERC721")) {
        return {contents: fs.readFileSync(
            contractPath(['ERC721', dep[dep.length - 1]]),
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
            'NFT.sol': {
                content: fs.readFileSync(
                    contractPath(['NFT.sol']), 
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
        abi: output.contracts['NFT.sol']['NFT'].abi,
        bytecode: output.contracts['NFT.sol']['NFT'].evm.bytecode.object
    }
}

// module.exports = {
//     compileERC721
// }

compileERC721()
.then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
