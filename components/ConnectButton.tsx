import React, { useEffect } from 'react';

import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { Web3Provider } from '@ethersproject/providers'

import { useEagerConnect, useInactiveListener } from 'lib/web3'
import { injected } from 'lib/connectors'

import { Button, useToast } from '@chakra-ui/react';
import { infoToast } from 'lib/toast';

export default function ConnectButton(): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { connector, activate, deactivate, active, error } = context
  
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()
  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  const toast = useToast();
  const activating = injected === activatingConnector
  const connected = injected === connector
  
  const getErrorMessage = (error: Error): string => {
    if (error instanceof NoEthereumProviderError) {
      return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
    } else if (error instanceof UnsupportedChainIdError) {
      return "You're connected to an unsupported network."
    } else if (
      error instanceof UserRejectedRequestErrorInjected
    ) {
      return 'Please authorize this website to access your Ethereum account.'
    } else {
      console.error(error)
      return 'An unknown error occurred. Check the console for more details.'
    }
  }

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [])

  useEffect(() => {
    if(error) {
      setActivatingConnector(undefined)
      infoToast(toast, getErrorMessage(error));
    }
  }, [error])

  useEffect(() => {
    if(active) {
      setActivatingConnector(undefined);
    }
  }, [active])
  
  const handleConnect = () => {
    console.log("Connecting")
    setActivatingConnector(injected)
    activate(injected)
  }

  const handleDisconnect = () => {
    console.log("Disconnecting")
    deactivate()
  }

  return (
    <>
      <Button
        variant="outline"
        isLoading={activating}
        onClick={!connected || error ? handleConnect : handleDisconnect }
        width="200px"
        border="2px"
        borderColor="black"
      > 
        {connected && !error ? "Disconnect" : "Connect to Metamask"}
      </Button>
    </>
  )
}