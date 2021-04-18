import React, { useState } from 'react';

import {
  Button,
  Stack,
  Center,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

import ethereum_address from 'ethereum-address';

import { ContentWrapper } from './ContentWrapper';

import SingleUpload from "components/SingleUpload";
import MultipleUpload from "components/MultipleUpload";

type UploadFormProps = {
  uploadToken: any;
  NFT: any;
  contractAddress: string;
  setContractAddress: any;
}

export default function UploadForm({
  uploadToken, 
  NFT,
  contractAddress, 
  setContractAddress
}: UploadFormProps): JSX.Element {

  const [uploadType, setUploadType] = useState<string>('single token');

  return (
    <>
      <ContentWrapper>
        <Stack>

          <Center mt="16px" mb="8px">
            <>
              <label htmlFor="contract-address" className="mr-4">Contract:</label>
              <Input 
                value={contractAddress}
                isInvalid={!(contractAddress == '') && !ethereum_address.isAddress(contractAddress)}
                errorBorderColor="crimson"
                borderColor={ethereum_address.isAddress(contractAddress) ? "green.300" : ""}
                width="320px" 
                id="contract-address"
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder={"Enter ERC721 contract address"}
              />
            </>
          </Center>
          
          <Center>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Upload: {uploadType}
              </MenuButton>
              <MenuList>
                <MenuItem                   
                  onClick={()  => setUploadType("single token")}
                >
                  Single token
                </MenuItem>
                <MenuItem 
                  onClick={()  => setUploadType("multiple tokens")}
                >
                  Multiple tokens
                </MenuItem>                
              </MenuList>
            </Menu>
          </Center>
        </Stack>
    
        {uploadType == "single token"
          ? <SingleUpload uploadToken={uploadToken} contractAddress={contractAddress}/>
          : <MultipleUpload uploadToken={uploadToken} contractAddress={contractAddress} NFT={NFT}/>
        }
      </ContentWrapper>
    </>
  )
}