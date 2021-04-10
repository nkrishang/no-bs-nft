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
  abi: any;
  bytecode: any;
}

export default function MainForm({abi, bytecode}: MainFormProps): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account } = context

  const { logTransaction, getDataFromSkyDB } = useDefaultSkyDB();
  const [transactions, setTransactions] = useState<string[]>([]);
  const [contractAddress, setContractAddress] = useState<string>('');

  const { uploadToken } = useContractCalls(contractAddress, abi)

  useEffect(() => {
    const getTxs = async () => {
      const data = await getDataFromSkyDB();
      setTransactions([...transactions, ...data[account as string].transactions])
    }

    if(account) getTxs();
  }, [account])

  const logNewTransaction = async (txHash: string) => {
    setTransactions([...transactions, txHash]);
    await logTransaction(account, txHash);
  }

  const handleTokenUpload = async () => {
    const tx = await uploadToken(account as string, abi);
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
              abi={abi}  
              bytecode={bytecode} 
              logTransaction={logNewTransaction} 
              setContractAddress={setContractAddress}
            />
          </TabPanel>
          <TabPanel>
            <UploadForm 
              uploadToken={handleTokenUpload} 
              logTransaction={logNewTransaction}
              contractAddress={contractAddress}
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