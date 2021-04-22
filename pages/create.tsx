import React, { useState, useEffect, useContext } from 'react';

import {
  Button,
  Stack,
  Center,
  Input,
  useToast,
  Text,
  Link,
  HStack
} from '@chakra-ui/react';

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ContentWrapper } from 'components/ContentWrapper';

import { deployBidExecutor, deployERC721, setNFTFactory } from 'lib/deploy';
import { supportedIds } from "lib/supportedIds";
import { errorToast, successToast } from "lib/toast";
import useGasPrice from "lib/useGasPrice";

import { ContractContext } from "lib/AppContext";

import { GetStaticProps } from 'next'
import { compileERC721 } from 'lib/compile';

export const getStaticProps: GetStaticProps = async (context) => {

  const {NFT, BidExecutor} = await compileERC721();

  return {
    props: {
      NFT,
      BidExecutor
    }
  }
}


export default function DeployForm({NFT, BidExecutor}: any): JSX.Element {
  
  const { logNewContract, setContractAddress, handleNewContract } = useContext(ContractContext);

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
      await logNewContract(account, address);
      setLoadingText("Tx 3 of 3: Configuring auction system");
      await handleNewContract();

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
      <Center mb="8">					
					<Stack>
						<p className="text-2xl text-gray-800 font-normal">
							Create an NFT collection!
						</p>

            <span>
              {`Here's one of our `} <Link href="https://thecryptopoops.com/" isExternal color="blue.500">favourites.</Link>
            </span>          
												
						<span>
							<span className="font-bold text-lg">
								{`1. `} 
							</span>
							Give your collection a name and symbol.
						</span>		

						<span>
							<span className="font-bold text-lg">
								{`2. `} 
							</span>
								Done! Pay the transaction costs and create your NFT collection.   
						</span>

            <span>
							<span className="font-bold text-lg">
								{`3. `} 
							</span>
								Your NFT collection comes with a built in auction system. (The interface for it is being built!)   
						</span>																	
					</Stack>	
				</Center> 

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
                isDisabled={!account} 
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