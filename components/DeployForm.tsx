import React, { useEffect, useState, useCallback, useRef } from 'react';

import {
  Button,
  Stack,
  Center,
  Input,
  useToast,
} from '@chakra-ui/react';

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ContentWrapper } from './ContentWrapper';

import { deployERC721 } from 'lib/deploy';

type DeployFormProps = {
  NFT: {abi: any, bytecode: any};
  BidExecutor: {abi: any, bytecode: any};
  logTransaction: any;
  setContractAddress: any;
}

export default function DeployForm({NFT, BidExecutor, logTransaction, setContractAddress}: DeployFormProps): JSX.Element {
  
  const toast = useToast();
  const context = useWeb3React<Web3Provider>()
  const { library, account } = context

  const [name, setName] = useState<string>('');
  const [symbol, setsymbol] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');

  const handleDeploy = async (library: any, account: any) => {
    setLoadingText('Deploying')
    setLoading(true);

    try {
      const {tx, address}: any = await deployERC721(NFT, BidExecutor, name, symbol, library.getSigner(account))
      console.log("Setting address: ", address);
      setContractAddress(address)
      await logTransaction(tx.hash)
      setLoadingText("Verifying on Etherscan (est. 30s)")

      await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          name: name,
          symbol: symbol
        }),
      })

      setName('');
      setsymbol('');

      toast({
        title: "Your collection has been deployed! Scroll down for a link to the transaction.",
        status: "success",
        variant: "subtle",
        duration: 10000,
        isClosable: true,
      });
    } catch(err) {
      
      toast({
        title: "Sorry, something went wrong. Please try again",
        status: "error",
        variant: "subtle",
        duration: 10000,
        isClosable: true,
      });
      
      console.log(err);
    }
    setLoading(false);
    setLoadingText('');
  }

  return (
    <>
      <ContentWrapper>
        <Center className="mt-8">
          <Stack>

            <label htmlFor="collection-name">Collection name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              id="collection-name" 
              placeholder="E.g. 'Crypto punks'"
            />

            <label htmlFor="collection-name">Collection symbol</label>
            <Input
              value={symbol} 
              onChange={(e) => setsymbol(e.target.value)} 
              id="collection-symbol" 
              placeholder="E.g. 'PUNKS'"
            />
  
            <Button 
              width="400px"
              loadingText={loadingText}
              isLoading={loading}
              onClick={() => handleDeploy(library, account)}
            >
              Create collection
            </Button>
          </Stack>    
        </Center>
      </ContentWrapper>
    </>
  )
}