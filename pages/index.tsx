import { useEffect, useState } from 'react';
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
import Account from 'components/Account';

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
            setContracts([...contracts, ...addressesToAdd])
          };
        }
      }
    }

    if(account && chainId) {
      getTxs()
    } else {
      setContracts([]);
    }
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
  }, [chainId])

  const logNewContract = async (acc: string, contractAddr: string) => {
    setContracts([...contracts, {
      address: contractAddr,
      chainId: chainId
    }])

    console.log("Loggin new contract: ", contractAddr);
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
      <div className="flex justify-center">
        <Stack mx="8">
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
            <MainForm 
              NFT={NFT} 
              BidExecutor={BidExecutor} 
              logContractAddress={logNewContract}
            />     
          </Center>
        </Stack>

        <Stack mt="16">
        
          <Account 
            NFTs={contracts}
          />
        </Stack>
      </div>
    </>
  )
}