import { ethers } from 'ethers';

const factory = async (abi, bytecode, signer) => {
    return new ethers.ContractFactory(abi, bytecode, signer);
}

export const deployBidExecutor = async (BidExecutorObject, signer) => {
  const BidExecutor_contractFactory = await factory(BidExecutorObject.abi, BidExecutorObject.bytecode, signer);

  try {
    const bidExecutor = await BidExecutor_contractFactory.deploy();
    const accountAddress = await signer.getAddress()
    
    console.log("BidExecutor contract deployed at: ", bidExecutor.address);
    console.log("Deployed with account: ", accountAddress);

    const bidExecutorTx = bidExecutor.deployTransaction;
    console.log("Transaction hash: ", bidExecutorTx.hash)
    await bidExecutorTx.wait();
    console.log("Transaction successful")

    return {
      tx: bidExecutorTx,
      address: bidExecutor.address
    }
  } catch(err) {
    console.log(err);
  }
}


export const deployERC721 = async (NftObject, name, symbol, bidExecutorAddress, signer) => {
  const NFT_contractFactory = await factory(NftObject.abi, NftObject.bytecode, signer);

  try {
    const nftFactory = await NFT_contractFactory.deploy(name, symbol, bidExecutorAddress)
    const accountAddress = await signer.getAddress()
    
    console.log("NFT contract deployed at: ", nftFactory.address);
    console.log("Deployed with account: ", accountAddress);

    const tx = nftFactory.deployTransaction;
    console.log("Transaction hash: ", tx.hash)
    await tx.wait()
    console.log("Transaction successful")
      
    return {
      tx: tx,
      address: nftFactory.address
    };
  } catch(err) {
    console.log(err)
  }
}

export const setNFTFactory = async (
  bidExecutorAddress, bidExecutorAbi, nftAddress, signer
) => {

  try {
    const bidExecutor = new ethers.Contract(bidExecutorAddress, bidExecutorAbi, signer);

    const bidExecutorTx = await bidExecutor.connect(signer).setNftFactory(nftAddress);
    await bidExecutorTx.wait(); 
    
    return {
      tx: bidExecutorTx 
    }
  } catch(err) {
    console.log(err)
  }
}