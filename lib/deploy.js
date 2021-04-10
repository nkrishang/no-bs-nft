import { ethers } from 'ethers';

const factory = async (abi, bytecode, signer) => {
    return new ethers.ContractFactory(abi, bytecode, signer);
}

export const deployERC721 = async (
  abi, bytecode, name, symbol, signer
) => {
    const contractFactory = await factory(abi, bytecode, signer);
    
    try {
      const contract = await contractFactory.deploy(name, symbol)
      console.log("Contract deployed at: ", contract.address);
      console.log("Deployed with account: ", (await signer.getAddress()))

      const tx = contract.deployTransaction;
      console.log("Transaction hash: ", tx.hash)
      await tx.wait()
      console.log("Transaction successful")
      
      return {tx: tx, address: contract.address};
    } catch(err) {
      console.log(err)
    }
}