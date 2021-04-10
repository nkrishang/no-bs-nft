import { useEffect } from 'react';
import { GetStaticProps } from 'next'

import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import { ContentWrapper } from 'components/ContentWrapper'
import ConnectButton from "components/ConnectButton";

import { Center, SimpleGrid, Stack } from '@chakra-ui/react'
import MainForm from 'components/MainForm';

import { compileERC721 } from 'lib/compile';
import { useDefaultSkyDB } from "lib/useSkyDB";

type ContractProps = {
  abi: any;
  bytecode: any;
}

export const getStaticProps: GetStaticProps = async (context) => {

  const {abi, bytecode} = await compileERC721();

  return {
    props: {
      abi: abi,
      bytecode: bytecode
    }
  }
}

export default function App({abi, bytecode}: ContractProps) {
  const context = useWeb3React<Web3Provider>()
  const { chainId, account } = context

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
          </Stack>        
        </Center>

        <Center mt="40px">
          <SimpleGrid rows={2} spacingY="24px">
            <SimpleGrid columns={2} spacingX={"40px"}>
              <p className="text-xl">{"Start minting. It's simple."}</p>
              <ConnectButton />
            </SimpleGrid>
            {account
              ? (
                <Stack>
                  <p>Account: {account}</p>
                  <p>Network: {chainId}</p>
                </Stack>
              )

              : <></>
            } 
          </SimpleGrid> 
        </Center>

        <Center className="mt-8">
          <MainForm abi={abi} bytecode={bytecode} />     
        </Center>

      </ContentWrapper>
    </>
  )
}