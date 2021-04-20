import React, { useEffect, useState } from 'react';

import {
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import UploadForm from './UploadForm';
import DeployForm from './DeployForm';

type MainFormProps = {
  NFT: {abi: any, bytecode: any};
  BidExecutor: {abi: any, bytecode: any};
  logContractAddress: any;
}

export default function MainForm({NFT, BidExecutor, logContractAddress}: MainFormProps): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account, chainId } = context

  const [contractAddress, setContractAddress] = useState<string>('');

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
                logContractAddress={logContractAddress}
                NFT={NFT}  
                BidExecutor={BidExecutor}                  
                setContractAddress={setContractAddress}
              />
            </TabPanel>
            <TabPanel>

            <UploadForm  
              NFT={NFT}                           
              contractAddress={contractAddress}
              setContractAddress={setContractAddress}
            />

            </TabPanel>
          </TabPanels>
        </Tabs>        
      </Stack>
  )
}