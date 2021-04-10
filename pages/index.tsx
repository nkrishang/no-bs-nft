import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import { ContentWrapper } from 'components/ContentWrapper'
import ConnectButton from "components/ConnectButton";

import { Button, Center, Input, Stack } from '@chakra-ui/react'
import MainForm from 'components/MainForm';

export default function App() {
  const context = useWeb3React<Web3Provider>()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context

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

        <Center className="mt-16">
          <MainForm />     
        </Center>

      </ContentWrapper>
    </>
  )
}