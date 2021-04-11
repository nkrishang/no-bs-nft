import type { NextApiRequest, NextApiResponse } from 'next'
import shell from 'shelljs';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if(req.method !== "POST") return;

  const { nft_address, bidExecutor_address, name, symbol } = req.body;
  console.log(`NFT Address: ${nft_address}, BE address: ${bidExecutor_address}, name: "${name}", symbol: "${symbol}"`);

  let outputs: any[] = [];

  const verificationPromise = new Promise((resolve, reject) => {
    console.log("Waiting 30 seconds before verification request");
    
    setTimeout(() => {
      const bidExecutor_output = shell.exec(
        `npx hardhat verify --network ropsten ${bidExecutor_address}`, 
        { encoding: 'utf-8' }
      )
      outputs.push(bidExecutor_output)
      const nft_output = shell.exec(
        `npx hardhat verify --network ropsten ${nft_address} "${name}" "${symbol}" ${bidExecutor_address}`, 
        { encoding: 'utf-8' }
      )
      outputs.push(nft_output);
      resolve('');
    }, 30000)
  })

  await verificationPromise;
  
  res.status(200).json(outputs);
}