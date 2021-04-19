import React from 'react';

import {
  Center,
  Input
} from '@chakra-ui/react';
import ethereum_address from 'ethereum-address';

import { ContentWrapper } from './ContentWrapper';
import MultipleUpload from "components/MultipleUpload";

type UploadFormProps = {
  NFT: any;
  contractAddress: string;
  setContractAddress: any;
}

export default function UploadForm({
  NFT, contractAddress, setContractAddress
}: UploadFormProps): JSX.Element {

  return (
    <>
      <ContentWrapper>        
        <Center mt="16px" mb="8px">
          <>
            <label htmlFor="contract-address" className="mr-4">NFT collection:</label>
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
    
        <MultipleUpload 
          NFT={NFT}
          contractAddress={contractAddress}
        />
      </ContentWrapper>
    </>
  )
}