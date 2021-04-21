import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { Web3Provider } from '@ethersproject/providers'

import { 
  Button, 
  useToast, 
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, 
  Stack,
  HStack,
  Tooltip,
  useClipboard,
  Text, 
  Flex,
  Link,
  Center
} from '@chakra-ui/react';
import { ExternalLinkIcon, PlusSquareIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons';

import { infoToast } from 'lib/toast';
import { injected } from 'lib/connectors'
import { supportedIds } from 'lib/supportedIds';

export default function ConnectButton(): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { connector, activate, deactivate, active, error, account, chainId, library } = context

  const [displayedError, setDisplayedError] = useState<boolean>(false);
  const [ethBal, setEthBal] = useState<string>('');
  
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>()

  const toast = useToast();
  const activating = injected === activatingConnector
  const connected = injected === connector
  
  const getErrorMessage = (error: Error): string => {
    if (error instanceof NoEthereumProviderError) {
      return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
    } else if (error instanceof UnsupportedChainIdError) {
      setDisplayedError(true)
      return "You're connected to an unsupported network. Networks supported: Mainnet, Matic, Ropsten, Mumbai."
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
    const getBal = async () => {
      const bal = await library?.getBalance(account as string);
      setEthBal(ethers.utils.formatEther(bal?.toString() as string));
    }
    
    if(account) getBal();
  }, [account, chainId])

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [])

  useEffect(() => {

    if(account) setDisplayedError(false)

    if(error) {
      setActivatingConnector(undefined)

      if(!displayedError || !(error instanceof UnsupportedChainIdError)) {
        infoToast(toast, getErrorMessage(error));
      }
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

  const modalDisconnect = () => {
    handleDisconnect()
    onClose();
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { hasCopied, onCopy } = useClipboard(account || "");

  return (
    <>
      <Button
        variant="outline"
        isLoading={activating}
        onClick={!connected || error ? handleConnect : onOpen }
        width="200px"
        border="2px"
        borderColor="black"
        rightIcon={<PlusSquareIcon hidden={!account}/>}
      > 
        {connected && !error 
          ? (account as string).slice(0,6) + "..." + (account as string).slice(-3) 
          : "Connect to Metamask"
        }
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody mt="4">
            <div>
              <HStack>
                <p className="text-lg font-semibold mr-2">
                  Address:
                </p>
                <p>
                  {account ? (account as string).slice(0,6) + "..." + (account as string).slice(-6) : ""}
                </p>
              </HStack>

              <HStack>
                <Flex
                  mr="2"
                  onClick={onCopy}
                  borderRadius="8px"                    
                  direction="column"
                  align="center"
                  justify="center"
                  cursor="pointer"                    
                >                    
                  <p className="text-gray-400">
                    {hasCopied ? <CheckIcon /> : <CopyIcon mx="1"/>} Copy address
                  </p> 
                </Flex>

                <Link mx="2" href={chainId ? supportedIds[chainId as number].contractExplorer + account : ""} isExternal>
                  <p className="text-gray-400">
                    View on explorer {<ExternalLinkIcon mx="1"/>}
                  </p>
                </Link>
              </HStack>

              <Stack mt="8">
              <HStack>
                <p className="text-lg font-semibold mr-2">
                  Network:
                </p>
                <p>
                  {chainId ? supportedIds[chainId].name : ""}
                </p>
              </HStack>

              <HStack>
                <p className="text-lg font-semibold mr-2">
                  Balance:
                </p>
                <p>
                  {account ? ethBal.slice(0,5) + (chainId == 80001 || chainId == 137 ? " MATIC" : " ETH") : " -" }
                </p>
              </HStack>
              </Stack>
            </div>
          </ModalBody>

          <Center>
            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                variant="outline"
                isLoading={activating}
                onClick={modalDisconnect}
                width="200px"
                border="2px"
                borderColor="black"
              >
                Disconnect
              </Button>
            </ModalFooter>
          </Center>
        </ModalContent>
      </Modal>
    </>
  )
}