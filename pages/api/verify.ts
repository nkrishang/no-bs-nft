import type { NextApiRequest, NextApiResponse } from 'next'
import shell from 'shelljs';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if(req.method !== "POST") return;

  const { address, name, symbol } = req.body;
  console.log(`Address: ${address}, name: "${name}", symbol: "${symbol}"`);

  let output;

  const verificationPromise = new Promise((resolve, reject) => {
    console.log("Waiting 30 seconds before verification request");
    
    setTimeout(() => {
      output = shell.exec(
        `npx hardhat verify --network ropsten ${address} "${name}" "${symbol}"`, 
        { encoding: 'utf-8' }
      )
      resolve('');
    }, 30000)
  })

  await verificationPromise;
  
  res.status(200).json(output);
}