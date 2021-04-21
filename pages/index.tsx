import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next'

import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import {
  Center, 
  HStack, 
  Link, 
  Stack
} from '@chakra-ui/react'
import { ExternalLinkIcon } from "@chakra-ui/icons";

import MainForm from 'components/MainForm';
import Account from 'components/Account';

import { compileERC721 } from 'lib/compile';
import { useDefaultSkyDB } from "lib/useSkyDB";
import { ContentWrapper } from 'components/ContentWrapper';
import Navbar from 'components/Navbar';
import CollectionList from 'components/CollectionList';


type ContractProps = {
  NFT: any;
  BidExecutor: any;
}

export const getStaticProps: GetStaticProps = async (context) => {

  const {NFT, BidExecutor} = await compileERC721();

  return {
    props: {
      NFT,
      BidExecutor
    }
  }
}

export default function App({NFT, BidExecutor}: ContractProps) {
  const context = useWeb3React<Web3Provider>()
  const { account, chainId } = context

  const { logContractAddress, getDataFromSkyDB, onboardUser } = useDefaultSkyDB();
  const [contracts, setContracts] = useState<any[]>([]);

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

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <Stack className="mt-16">
          {/* <Center className="mt-16" mb="4">
            <Stack>          
              <p className="text-8xl font-black mb-4">
                No bullshit NFT.
              </p>                                      
              <p  className="text-3xl font-light">
                Mint an individual NFT or a collection without the extra platform bullshit.
              </p>
              <HStack>
                <Link href="https://github.com/nkrishang/no-bs-nft" isExternal mr="8">
                    Source code
                </Link>
                <Link href="https://twitter.com/NFTLabsHQ" isExternal>
                    {"Built with @NFTLabsHQ"}
                </Link>
              </HStack>
            </Stack>        
          </Center> */}

          <Center>
            <MainForm 
              NFT={NFT} 
              BidExecutor={BidExecutor} 
              logContractAddress={logNewContract}
            />     
          </Center>
        </Stack>
      </ContentWrapper>
      
      <CollectionList NFTs={contracts}/>
    </>
  )
}