import { useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import { ethers } from "ethers";
import ethereum_address from 'ethereum-address';

import { useDefaultSkyDB } from "lib/useSkyDB";

export default function useContractCalls(addr: string, abi: any) {
  const { library, account } = useWeb3React<Web3Provider>();
  const { logTransaction } = useDefaultSkyDB();

  const contract = useRef<any>();

  useEffect(() => {
    
    if(!addr || !ethereum_address.isAddress(addr)) return;

    const provider = new ethers.providers.JsonRpcProvider(
      `https://eth-ropsten.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      "ropsten"
    );
    console.log("Contract addr: ", addr);
    contract.current = new ethers.Contract(addr, abi, provider);
  }, [addr, abi])

  /// Uploads all URIs in skylinks as moments. Returns transaction object.
  async function uploadToken(to: string, skylink: string, txNonce: number) {
    if (!library) return;
    console.log("Calling uploadToken with address: ", account);
    console.log("Minting to address: ", to);
    console.log("Skylink uploaded to contract: ", skylink);
    try {
      const tx = await contract.current
        .connect(library.getSigner(account as string))
        .mint( to, skylink, { gasLimit: 1000000, nonce: txNonce });

      console.log("address:", to, "tx:", tx.hash);
      await tx.wait();

      await logTransaction(account, tx.hash);      

      return tx;
    } catch (err) {
      console.log(err);
    }
  }

  /// Uploads all URIs in skylinks as moments. Returns transaction object.
  async function uploadMagic(to: any, skylink: string, txNonce: number) {
    if (!library) return;
    console.log("Calling uploadToken with address: ", to);
    console.log("Minting to address: ", to);
    console.log("Skylink uploaded to contract: ", skylink);
    console.log("contract current: ", contract.current)
    try {
      const tx = await contract.current
        .connect(library.getSigner(account as string))
        .mint( to, skylink, { gasLimit: 1000000, nonce: txNonce });

      console.log("address:", to, "tx:", tx.hash);

      await logTransaction(to, tx.hash);      

      return tx;
    } catch (err) {
      console.log(err);
    }
  }

  /// Grants account minter role
  async function grantMinterRole(addr:string, txNonce: number) {
    if (!library) return;
    console.log("Calling grantMinterRole with address: ", account);

    try {
      const tx = await contract.current
      .connect(library.getSigner(account as string))
      .grantMinterRole( addr, { gasLimit: 1000000, nonce: txNonce });

      console.log("address:", addr, "tx:", tx.hash);
      await tx.wait();

      await logTransaction(account, tx.hash);

      return tx
    } catch(err) {
      console.log(err);
    }
  }

  return {
    uploadToken,
    uploadMagic,
    grantMinterRole
  };
}

// Get approval in useEffect and set approval