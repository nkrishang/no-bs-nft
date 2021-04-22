import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import {
  Center, 
  SimpleGrid, 
  Stack,
  Tooltip,
  useClipboard,
  Text,
  Flex,
  Badge,
  Box, 
  Divider,
  HStack,
  Link
} from '@chakra-ui/react'

import { supportedIds } from "lib/supportedIds";

import Account from "components/Account";
import ConnectButton from "components/ConnectButton";
import CollectionList from "components/CollectionList";

export default function Navbar({NFTs}: any): JSX.Element {

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
    <div className="w-full flex justify-between border-b-2 border-gray-200 py-4 sticky top-0 bg-white shadow mb-16">
      <HStack>
        <Link href="/">
          <p className="text-gray-800 font-black text-3xl ml-8 mr-8">
            No Bullshit NFT.
          </p>
        </Link>

        <Link href="/create">
          <p className="mx-4">
            Create collection
          </p>
        </Link>

        <Link href="/upload" mx="2">
        <p className="mx-4">
            Upload media to collection
          </p>
        </Link>

        {/* <Link href="/create">
          <p className="text-md text-gray-700 mx-2">
            Create collection
          </p>
        </Link>
        <Link href="/manage">
          <p className="text-md text-gray-700 mx-2">
            Manage collection
          </p>
        </Link>         */}
      </HStack>

      <HStack mr="4">
      {supportedIds.ids.includes(chainId as number)
        ? (
            <Badge colorScheme="green" fontSize="1em" p="4px"  mx="4">
              {supportedIds[`${chainId as number}`].name}
            </Badge>
          )
        : (
            <p className={"text-red-500 mx-4"}>
              {account ? "Network: unsupported" : ""}
            </p>
          )
      }      
        <ConnectButton />
      </HStack>
    </div>
  )
}