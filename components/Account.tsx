import { useEffect, useState } from 'react';

import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import ConnectButton from "components/ConnectButton";
import NFTRow from "components/NFTRow";

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
  Box, 
  Divider
} from '@chakra-ui/react'
import { ExternalLinkIcon } from "@chakra-ui/icons";

import { supportedIds } from "lib/supportedIds";

export default function Account({NFTs}: any): JSX.Element {

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
      // bottom="40px"
      right="80px"
      maxH="560px"
      width="400px"
      overflowX="hidden"
      bg="white"
      borderRadius="12px"
      // zIndex="100"
      // boxShadow="2px 2px 2px rgba(0, 0, 0, 0.10)"
      boxShadow="md"
      border="2px"
      borderColor="gray.300"
      direction="column"
      align="center"
    >
      {/* <div className="border border-black rounded-md" style={{width: "240px", height: "200px"}}> */}
        <Center>
          <SimpleGrid rows={4} spacingY="8px">            
            
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
                    {account 
                      ? (account as string).slice(0,6) + "..." + (account as string).slice(-3)                         
                      : "-"
                    }
                  </Text>
                </Flex>
              </Tooltip>
            </Center>
            <Stack mb="8px"> 
              <Center>
                <Box>                                           
                  {supportedIds.ids.includes(chainId as number)
                    ? (
                        <Badge colorScheme="green" fontSize="1em" p="4px">
                          {supportedIds[`${chainId as number}`].name}
                        </Badge>
                      )
                    : (
                      <p className={"text-red-500"}>
                        Network: unsupported
                      </p>
                    )
                  }
                </Box>
              </Center>
              <Center>
                <Stack>
                  <Center>
                    <p>Balance: {account ? ethBal.slice(0,5) + (chainId == 80001 || chainId == 137 ? " MATIC" : " ETH") : " -" }</p>
                  </Center>                  
                </Stack>                
              </Center>
            </Stack>
            <Center mb="4">
              <ConnectButton />
            </Center>

            <Divider colorScheme="black"/>

            <Center>
              <Stack width="320px">
                <Center>
                  <p className="text-xl font-bold">
                    Your NFT collections
                  </p>
                </Center>
                
                <Stack 
                  maxH="280px" 
                  overflowY="scroll"                  
                >
                  <Center hidden={NFTs.length > 0}>
                    <Text>
                      No NFTs minted with this account.
                    </Text>
                  </Center>
                  {NFTs.map((NFT: any) => {

                    return (
                      <NFTRow NFTAddress={NFT.address} chainId={NFT.chainId} key={NFT.address}/>
                    )
                  })}
                </Stack>
              </Stack>
            </Center>
            
          </SimpleGrid>
        </Center>
      {/* </div> */}
    </Flex>
  )
}