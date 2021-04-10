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

    const provider = new ethers.providers.JsonRpcProvider(
      `https://eth-ropsten.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ROPSTEN_KEY}`,
      "ropsten"
    );

    contract.current = new ethers.Contract(addr, abi, provider);
  }, [])

  /// Uploads all URIs in skylinks[] as moments. Returns transaction object.
  async function uploadMoment(skylink: string) {
    if (!library) return;
    console.log("Calling uploadMoments with address: ", account);

    try {
      const tx = await contract.current
        .connect(library.getSigner(account as string))
        .uploadToken(skylink, { gasLimit: 1000000 });

      console.log("address:", account, "tx:", tx.hash);
      await tx.wait();

      await logTransaction(account, tx.hash);      

      return tx;
    } catch (err) {
      console.log(err);
    }
  }

  return {
    uploadMoment
  };
}

// Get approval in useEffect and set approval