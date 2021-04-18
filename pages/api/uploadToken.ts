import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from "ethers";

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const { address, abi, signer, transactions, account, email } = req.body;

  const nftContract = new ethers.Contract(address, abi, signer);
  let txNonce = await signer.getTransactionCount();

  try {
    for(let i = 0; i < transactions.length; i++) {

      const { URI, amount } = transactions[i];
      
      for(let j = 1; j <= amount; j++) {

        const tx = await nftContract.mint(account, URI, {
          gasLimit: 1000000,
          nonce: txNonce
        })
        console.log("Tx hash: ", tx.hash);
        txNonce++
      }
    }
  } catch(err) {
    console.log(err);
  }

  console.log("Transactions complete");

  res.end();
}