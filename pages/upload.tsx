import React, { useContext } from 'react';

import {
  Center,
	HStack,
  Input,
	Stack
} from '@chakra-ui/react';
import ethereum_address from 'ethereum-address';

import { ContentWrapper } from 'components/ContentWrapper';
import MultipleUpload from "components/MultipleUpload";
import { ContractContext } from 'lib/AppContext';

import { GetStaticProps } from 'next'
import { compileERC721 } from 'lib/compile';

export const getStaticProps: GetStaticProps = async (context) => {

  const {NFT} = await compileERC721();

  return {
    props: {
      NFT
    }
  }
}

export default function UploadForm({NFT}: any): JSX.Element {

	const { contractAddress, setContractAddress } = useContext(ContractContext);

  // console.log( "ABI: ", NFT.abi)
  return (
    <>
      <ContentWrapper mb="16">
				<Center mb="12">					
					<Stack>
						<p className="text-2xl text-gray-800 font-normal mb-4">
							Upload any media file ( images to PDFs ) to your NFT collection.
						</p>
												
						<span>
							<span className="font-bold text-lg">
								{`1. `} 
							</span>
							Paste the address of your NFT collection (an ERC 721 contract). 
						</span>		

						<span>
							<span className="font-bold text-lg">
								{`2. `} 
							</span>
								Upload your media files and specify a name and symbol for the file. Then, specify the amount tokens of
								that file you would like to create.   
						</span>

						<span>
							<span className="font-bold text-lg">
								{`3. `} 
							</span>
							Upload your media files to your collection! You will have to choose a payment method to pay transaction costs.   
						</span>																		
					</Stack>	
				</Center>        
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