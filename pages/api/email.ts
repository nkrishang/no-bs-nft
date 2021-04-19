import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers';
import { supportedIds } from "lib/supportedIds";

const nodemailer = require("nodemailer");

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const { email, txHash, contractAddress, chainId } = req.body;
  console.log("TX: ", txHash);
  console.log("Waiting for final transaction to resolve.")

  let provider: any;
  console.log("ChainID :", chainId)
  switch(chainId) {
    case 1:
      provider = new ethers.providers.JsonRpcProvider(
        `https://eth-mainnet.alchemyapi.io/v2/7kwH0c_l1lJSG-8-ty4yzt_JrUSyPcPS`,
        "mainnet"
      );
      break;
    case 3:
      provider = new ethers.providers.JsonRpcProvider(
        `https://eth-ropsten.alchemyapi.io/v2/7kwH0c_l1lJSG-8-ty4yzt_JrUSyPcPS`,
        "ropsten"
      );
      break;
    case 137:
      provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.maticvigil.com/?jwt=eyJhbGciOiJIUzI1NiJ9.a3Jpc2hhbmcubm90ZUBnbWFpbC5jb20.VM9Ae_oaBmEPbhAKH9nxq-ZwhAVlIEx_XhLirvfvswc",
        chainId
      ); 
      break;
    case 80001:
      provider = new ethers.providers.JsonRpcProvider(
        "https://rpc-mumbai.maticvigil.com",
        chainId
      );
      break;
    default:
      provider = new ethers.providers.JsonRpcProvider(
        `https://eth-mainnet.alchemyapi.io/v2/7kwH0c_l1lJSG-8-ty4yzt_JrUSyPcPS`
      );
  }

  console.log("Provider: ", provider);

  let txReceiptReceived = false;

  while(!txReceiptReceived) {

    const receiptPromise = new Promise((resolve, reject) => {
      console.log("Checking")
      setTimeout(() => {
        resolve('');
      }, 1000)
    })

    const receipt = await provider.getTransactionReceipt(txHash);

    if(receipt != null) {
      txReceiptReceived = true;
      console.log(receipt.status == 1 ? "Transaction succesful!" : "Transaction reverted");
    } else {
      await receiptPromise;
    }
  }

  console.log("Sending email now")
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "Gmail",
    // secure: true,
    auth: {
      user: "nobsnfts@gmail.com", // generated ethereal user
      pass: process.env.EMAIL_PASSWORD
    },
  });

  try {

    let info = await transporter.sendMail({
      from: '"Krishang" <nobsnfts@gmail.com>', // sender address
      to: `${email}`, // list of receivers
      subject: `Your transactions on NoBullshitNFTs are complete!`, // Subject line
      text: `Your transactions on NoBullshitNFTs are complete!`, // plain text body
      html: `
        <h1>No bullshit NFTs</h1>

        <b>Your tokens have been successfully uploaded to your NFT collection!</b>

        <span>View your collection: <a href="${supportedIds[chainId].contractExplorer + contractAddress}">${contractAddress}</a></span>
      `, // html body
    });

    console.log("Message sent: %s", info.messageId);

  } catch(err) {
    console.log(err);
  }

  console.log("Sent email!");

  res.end();
}