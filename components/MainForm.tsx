import React, { useEffect, useState } from 'react';

import {
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link
} from '@chakra-ui/react';

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import UploadForm from './UploadForm';
import DeployForm from './DeployForm';

import { useDefaultSkyDB } from "lib/useSkyDB";
import useContractCalls from 'lib/useContractCalls';

type MainFormProps = {
  NFT: {abi: any, bytecode: any};
  BidExecutor: {abi: any, bytecode: any};
}

export default function MainForm({NFT, BidExecutor}: MainFormProps): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account } = context

  const { logTransaction, getDataFromSkyDB } = useDefaultSkyDB();
  const [transactions, setTransactions] = useState<string[]>([]);
  const [contractAddress, setContractAddress] = useState<string>('');

  const { uploadToken } = useContractCalls(contractAddress, NFT.abi) // CHECK

  useEffect(() => {
    const getTxs = async () => {
      const data = await getDataFromSkyDB();
      if(data) {
        if (data[account as string]) {
          
          if(data[account as string].transactions) setTransactions([...transactions, ...data[account as string].transactions]);
        }
      }
    }

    if(account) {
      getTxs()
    } else {
      setTransactions([]);
    }
  }, [account])

  const logNewTransaction = async (txHash: string) => {
    setTransactions([...transactions, txHash]);
    await logTransaction(account, txHash);
  }

  const handleTokenUpload = async (to: string, skylink: string) => {
    const tx = await uploadToken(to, skylink);
    await logNewTransaction(tx.hash);
  }

  return (
    <Stack direction="column" mb="20px">
      <Tabs isFitted variant="enclosed" width="900px" mb="20px">
        <TabList>
          <Tab> Deploy your NFT collection</Tab>
          <Tab>Upload media to your collection</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <DeployForm 
              NFT={NFT}  
              BidExecutor={BidExecutor} 
              logTransaction={logNewTransaction} 
              setContractAddress={setContractAddress}
            />
          </TabPanel>
          <TabPanel>
            <UploadForm 
              uploadToken={handleTokenUpload} 
              contractAddress={contractAddress}
              setContractAddress={setContractAddress}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {transactions.length

        ? (
          <Stack mb="16px">
            <p className="text-2xl font-bold">Your transactions</p>

            {transactions.map(txhash => {
              return (
                <Link 
                  key={txhash}
                  isExternal
                  href={`https://ropsten.etherscan.io/tx/${txhash}`}
                  mx="8px"
                >
                  {txhash}
                </Link>
              )
            })}
          </Stack>
        )

        : (
          ''
        )
      }
    </Stack>
  )
}