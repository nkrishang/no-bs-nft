import { useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import { ethers } from "ethers";

import { useDefaultSkyDB } from "lib/useSkyDB";

export default function useContractCalls(addr: string, abi: any) {
  const { library, account } = useWeb3React<Web3Provider>();
  const { logTransaction } = useDefaultSkyDB();

  const contract = useRef<any>();

  useEffect(() => {
    
    if(!addr) return;

    const provider = new ethers.providers.JsonRpcProvider(
      `https://eth-ropsten.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ROPSTEN_KEY}`,
      "ropsten"
    );

    contract.current = new ethers.Contract(addr, abi, provider);
  }, [])

  /// Uploads all URIs in skylinks[] as moments. Returns transaction object.
  async function uploadToken(to: string, skylink: string) {
    if (!library) return;
    console.log("Calling uploadTokens with address: ", account);

    try {
      const tx = await contract.current
        .connect(library.getSigner(account as string))
        .mint( account, skylink, { gasLimit: 1000000 });

      console.log("address:", account, "tx:", tx.hash);
      await tx.wait();

      await logTransaction(to, tx.hash);      

      return tx;
    } catch (err) {
      console.log(err);
    }
  }

  return {
    uploadToken
  };
}

// Get approval in useEffect and set approval