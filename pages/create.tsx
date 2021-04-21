import React, { useState, useEffect } from 'react';

import {
  Button,
  Stack,
  Center,
  Input,
  useToast,
  Text
} from '@chakra-ui/react';

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ContentWrapper } from 'components/ContentWrapper';

import { deployBidExecutor, deployERC721, setNFTFactory } from 'lib/deploy';
import { supportedIds } from "lib/supportedIds";
import { errorToast, successToast } from "lib/toast";
import useGasPrice from "lib/useGasPrice";

type DeployFormProps = {
  logContractAddress:any;
  NFT: {abi: any, bytecode: any};
  BidExecutor: {abi: any, bytecode: any};
  setContractAddress: any;
}

export default function DeployForm({logContractAddress, NFT, BidExecutor, setContractAddress}: DeployFormProps): JSX.Element {
  
  const toast = useToast();
  const context = useWeb3React<Web3Provider>()
  const { library, account, chainId } = context

  const [name, setName] = useState<string>('');
  const [symbol, setsymbol] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');


  // const [estimatedCost, setEstimatedCost] = useState<string|number>('')
  // const [estimatedCostOnMatic, setEstimatedCostOnMatic] = useState<string|number>('');

  // const { costEstimates } = useGasPrice(chainId as number || 1);
  // const gasMethods = useGasPrice(137);

  // useEffect(() => {
  //   console.log("Deploy cost estimate: ", costEstimates.deployTransaction);
  //   console.log("Deploy cost estimate MATICMATIC: ", gasMethods.costEstimates.deployTransaction);

  //   setEstimatedCost(costEstimates.deployTransaction)
  //   setEstimatedCostOnMatic(gasMethods.costEstimates.deployTransaction);
  // })

  const handleTxError = (err: any) => {
    setLoading(false);
    setLoadingText('');
    errorToast(toast, "Sorry, something went wrong. Please try again");
    console.log(err)
  }

  const handleDeploy = async (library: any, account: any) => {
    setLoadingText('Tx 1 of 3: Deploying auction system')
    setLoading(true);

    let bidExecutorAddress;
    let nftAddress;

    try {
      const {tx, address}: any = await deployBidExecutor(BidExecutor,library.getSigner(account));
      await tx.wait()
      bidExecutorAddress = address;

      setLoadingText("Tx 2 of 3: Deploying NFT collection")
    } catch(err) {
      handleTxError(err);
      return
    }

    try {
      const {tx, address}: any = await deployERC721(NFT, name, symbol, bidExecutorAddress, library.getSigner(account));
      await tx.wait()
      
      nftAddress = address;
      setContractAddress(address);
      await logContractAddress(account, address);
      setLoadingText("Tx 3 of 3: Configuring auction system");
    } catch(err) {
      handleTxError(err);
      return
    }

    try {
      const { tx }: any = await setNFTFactory(bidExecutorAddress, BidExecutor.abi, nftAddress, library.getSigner(account));
      await tx.wait();
      
    } catch(err) {
      handleTxError(err);
      return
    }

    if(!(chainId == 137 || chainId == 80001)) {
      setLoadingText("Verifying on Etherscan (est. 30s)");
      await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: supportedIds[(chainId as number).toString()].name.toLowerCase(),
          nft_address: nftAddress,
          bidExecutor_address: bidExecutorAddress, 
          name: name,
          symbol: symbol
        })
      })
    }

    successToast(
      toast, 
      `Your NFT collection has been created on ${supportedIds[chainId as number].name}.`
    )

    setName('');
    setsymbol('');
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
            
            <Stack>
              <Button 
                width="400px"
                loadingText={loadingText}
                isLoading={loading}
                onClick={() => handleDeploy(library, account)}
              >
                Create collection
              </Button>
              {/* <Text>
                {chainId ? `Estimated cost of deployment on ${supportedIds[chainId as number].name}: ${estimatedCost} USD` : ""}
              </Text>
              <Text hidden={chainId == 3 || chainId == 80001}>
                Estimated cost of deployment on Matic: {estimatedCostOnMatic} USD
              </Text> */}
            </Stack>
          </Stack>    
        </Center>
      </ContentWrapper>
    </>
  )
}