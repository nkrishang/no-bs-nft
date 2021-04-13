import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next'

import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import { ContentWrapper } from 'components/ContentWrapper'
import ConnectButton from "components/ConnectButton";

import {
  Center, 
  Link, 
  SimpleGrid, 
  Stack,
  Tooltip,
  useClipboard,
  Text,
  Flex,
  Badge,
  Box 
} from '@chakra-ui/react'
import { ExternalLinkIcon } from "@chakra-ui/icons";
import MainForm from 'components/MainForm';

import { compileERC721 } from 'lib/compile';
import { useDefaultSkyDB } from "lib/useSkyDB";

export default function Account(): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { chainId, account, library } = context

  const [ethBal, setEthBal] = useState<string>('');
  const { hasCopied, onCopy } = useClipboard(account || "");

  useEffect(() => {
    const getBal = async () => {
      const bal = await library?.getBalance(account as string);
      setEthBal(ethers.utils.formatEther(bal?.toString() as string));
    }

    if(account) getBal();
  }, [account, chainId])

  return (
    <Flex
      // ref={ref}
      position="fixed"
      padding="20px"
      bottom="40px"
      right="40px"
      height="280px"
      width="240px"
      overflowX="hidden"
      bg="white"
      borderRadius="12px"
      zIndex="100"
      boxShadow="4px 4px 10px rgba(0, 0, 0, 0.25)"
      direction="column"
      align="center"
    >
      {/* <div className="border border-black rounded-md" style={{width: "240px", height: "200px"}}> */}
        <Center>
          <SimpleGrid rows={3} spacingY="8px">
            <Center>
              <Tooltip
                label={hasCopied ? "Copied!" : "Copy to Clipboard"}
                color="white"
                bg="black"
              >
                <Flex
                  onClick={onCopy}
                  borderRadius="8px"
                  height="70px"
                  width="140px"
                  direction="column"
                  align="center"
                  justify="center"
                  cursor="pointer"
                  _hover={{
                  bg: "#EEE",
                  }}
                >
                  <Text fontWeight="bold" fontSize="16px" color="black">
                    Account
                  </Text>
                  <Text color="#999">
                    {account ? (account as string).slice(0,6) + "..." + (account as string).slice((account as string).length - 3, (account as string).length) : "-"}
                  </Text>
                </Flex>
              </Tooltip>
            </Center>
            <Stack mb="8px"> 
              <Center>
                <Box>                                           
                  {chainId === 3
                    ? (
                        <Badge colorScheme="green" fontSize="0.8em" py="4px">
                          Ropsten
                        </Badge>
                      )
                    : (
                      <p className={account ? "text-red-500" : ""}>
                        {account ? "Please switch to Ropsten" : "Network: -"}
                      </p>
                    )
                  }
                </Box>
              </Center>
              <Center>
                <Stack>
                  <Center>
                    <p>Balance: {account ? ethBal.slice(0,5) + " ETH" : " -" }</p>
                  </Center>
                  <Link href="https://faucet.ropsten.be/" isExternal>
                    Get some Ropsten ether <ExternalLinkIcon mx="2px" />
                  </Link>
                </Stack>                
              </Center>
            </Stack>
            <ConnectButton />
          </SimpleGrid>
        </Center>
      {/* </div> */}
    </Flex>
  )
}