import 'tailwindcss/tailwind.css'

import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react"

import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";

import { useWeb3React } from '@web3-react/core';

import React, { createContext, useContext, useState, useEffect } from "react";
import { MetaData } from "components/MetaData";

import { GetStaticProps } from 'next'
import { compileERC721 } from 'lib/compile';
import { useDefaultSkyDB } from "lib/useSkyDB";

export const ContractContext = createContext<any>('');

export function ContractWrapper({ NFT, BidExecutor, children }: any) {
  
  const context = useWeb3React<Web3Provider>()
  const { account, chainId } = context

  const { logContractAddress, getDataFromSkyDB, onboardUser } = useDefaultSkyDB();

  const [contracts, setContracts] = useState<any[]>([]);
  const [contractAddress, setContractAddress] = useState<any[]>([]);

  const [uploadTokenLoading, setUploadTokenLoading] = useState<boolean>(false);

  useEffect(() => {
    
    const onboard = async (acc: string) => {
      try {
        await onboardUser(acc);
      } catch(err) {
        console.log(err);
      }
    }
    
    if(account) onboard(account);
  }, [account])

  useEffect(() => {
    const getTxs = async () => {
      const data = await getDataFromSkyDB();
      if(data) {
        if (data[account as string]) {
          
          if(data[account as string].NFTs) {
            const addressesInContracts = contracts.map((contract: any) => contract.address);
            const addressesToAdd = data[account as string].NFTs.filter((contract: any) => contract.chainId == chainId && !addressesInContracts.includes(contract.address))
            setContracts([...addressesToAdd])
          };
        }
      }
    }

    if(account && chainId) {
      getTxs()
    } else {
      setContracts([]);
    }
  }, [account, chainId])

  const logNewContract = async (acc: string, contractAddr: string) => {
    setContracts([...contracts, {
      address: contractAddr,
      chainId: chainId
    }])

    // console.log("Loggin new contract: ", contractAddr);
    try {
      await logContractAddress(acc, {
        address: contractAddr,
        chainId: chainId
      })
    } catch(err) {
      console.log(err)
    }
  }

  let sharedState = {
    NFT, 
    BidExecutor,
    contracts,
    setContracts,
    logContractAddress,
    contractAddress,
    setContractAddress,
    uploadTokenLoading,
    setUploadTokenLoading
  };

  return (
    <ContractContext.Provider value={sharedState}>
      {children}
    </ContractContext.Provider>
  );
}