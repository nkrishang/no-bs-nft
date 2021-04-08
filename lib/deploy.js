require('dotenv').config();

const { ethers } = require('ethers');
const { compileERC721 } = require('./compile');
const execSync = require('child_process').execSync;

const provider = new ethers.providers.JsonRpcProvider(
  `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
  "ropsten"
);

const wallet = new ethers.Wallet(
  process.env.ROPSTEN_PRIVATE_KEY,
  provider
)

const factory = async (abi, bytecode) => {
    return new ethers.ContractFactory(abi, bytecode, wallet)
}

const deployERC721 = async (name, symbol) => {

    const {abi, bytecode} = await compileERC721();
    const contractFactory = await factory(abi, bytecode);
    
    try {
      const contract = await contractFactory.deploy(name, symbol)
      console.log("Contract deployed at: ", contract.address);
      
      const tx = contract.deployTransaction;
      await tx.wait()
      console.log("Transaction successful")
      console.log("Verifying...")
      execSync(
        `npx hardhat verify --network ropsten ${contract.address} ${name} ${symbol}`, 
        { encoding: 'utf-8' }
      )
      console.log(`Verification successful: https://ropsten.etherscan.io/address/${contract.address}`)

    } catch(err) {
      console.log(err)
    }
}

deployERC721("solc", "SOLC")
.then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

// const backup = (addr, name, symbol) => {
//   execSync(
//     `npx hardhat verify --network ropsten ${addr} ${name} ${symbol}`, 
//     { encoding: 'utf-8' }
//   )
//   console.log(`Verification successful: https://ropsten.etherscan.io/address/${addr}`)
// }


// backup("0xf807804D8DA3020588681D9336A5193A3E49635f","solc", "SOLC")
// .then(() => process.exit(0))
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });