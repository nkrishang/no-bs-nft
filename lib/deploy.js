import { ethers } from 'ethers';

const factory = async (abi, bytecode, signer) => {
    return new ethers.ContractFactory(abi, bytecode, signer);
}

export const deployERC721 = async (
  NftObject, BidExecutorObject, name, symbol, signer
) => {
  const BidExecutor_contractFactory = await factory(BidExecutorObject.abi, BidExecutorObject.bytecode, signer);
  const NFT_contractFactory = await factory(NftObject.abi, NftObject.bytecode, signer);
  
  let bidExecutor;
  let bidExecutorTx
  try {
    bidExecutor = await BidExecutor_contractFactory.deploy();
    console.log("BidExecutor Contract deployed at: ", bidExecutor.address);
    console.log("Deployed with account: ", (await signer.getAddress()))

    bidExecutorTx = bidExecutor.deployTransaction;
    await bidExecutorTx.wait();
  } catch(err) {
    console.log(err);
    return
  }

  try {
    const nftFactory = await NFT_contractFactory.deploy(name, symbol, bidExecutor.address)
    console.log("Contract deployed at: ", nftFactory.address);
    console.log("Deployed with account: ", (await signer.getAddress()))

    const tx = nftFactory.deployTransaction;
    console.log("Transaction hash: ", tx.hash)
    await tx.wait()
    console.log("Transaction successful")

    const bidExecutorTx = await bidExecutor.connect(signer).setNftFactory(nftFactory.address);
    await bidExecutorTx.wait(); 
      
    return {
      tx: {
        nft_deploy: tx,
        bidExecutor_deploy: bidExecutorTx
      }, 
      address: {
        nft: nftFactory.address,
        bidExecutor: bidExecutor.address
      }
    };
  } catch(err) {
    console.log(err)
  }
}