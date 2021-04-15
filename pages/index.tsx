import { useEffect } from 'react';
import { GetStaticProps } from 'next'

import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import {
  Center, 
  Link, 
  Stack
} from '@chakra-ui/react'
import { ExternalLinkIcon } from "@chakra-ui/icons";

import MainForm from 'components/MainForm';
import { ContentWrapper } from 'components/ContentWrapper'

import { compileERC721 } from 'lib/compile';
import { useDefaultSkyDB } from "lib/useSkyDB";

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
  const { account } = context

  const { onboardUser } = useDefaultSkyDB();

  

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

  return (
    <>
      <ContentWrapper>

        <Center className="mt-16">
          <Stack>          
            <p className="text-8xl font-black mb-4">
              No bullshit NFT.
            </p>                                      
            <p  className="text-3xl font-light">
              Mint an individual NFT or a collection without the extra platform bullshit.
            </p>
            <Link href="https://github.com/nkrishang/no-bs-nft" isExternal>
                Source code <ExternalLinkIcon mx="2px" />
            </Link>
          </Stack>        
        </Center>

        <Center className="mt-8">
          <MainForm NFT={NFT} BidExecutor={BidExecutor} />     
        </Center>

      </ContentWrapper>
    </>
  )
}