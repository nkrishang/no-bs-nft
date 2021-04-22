import { 
  Button, 
  Stack,
  Tooltip,
  Text, 
  Flex,
  Center,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';

import NFTRow from "components/NFTRow";
import { ContractContext } from 'lib/AppContext';
import { useContext } from 'react';

export default function CollectionList({NFTs}: any): JSX.Element {

  const { newContractAdded, uploadTokenLoading } = useContext(ContractContext);

  return (
    <Flex
      position="fixed"
      bottom="24px"
      right="72px"
      // height="70px"
      // bg="white"
      // borderRadius="50px"
      cursor="pointer"
      align="center"
      justify="center"
      zIndex="100"
      // border="2px"
      // borderColor="red"
    > 

      {uploadTokenLoading
      
        ? (
          <SimpleGrid columns={2} spacingX="8">

            <Popover>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  width="200px"
                  border={"2px"}
                  borderColor={newContractAdded ? "green.500" : "gray.400"}
                  boxShadow="md"
                  colorScheme={newContractAdded ? "green" : ""}
                  bg="white"
                >
                  Your NFT collections.
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />

                <Center>
                  <PopoverHeader>Your NFT collections.</PopoverHeader>
                </Center>
                <PopoverBody>
                <Stack 
                  maxH="400px"
                  paddingBottom="8" 
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
                </PopoverBody>
              </PopoverContent>
            </Popover>

            <Tooltip
              hidden={!uploadTokenLoading}
              label={`Your transactions are being mined. Please wait and don't close the browser window.`}
              color="white"
              bg="black"
            >
              <Button
                hidden={!uploadTokenLoading}                                
                onClick={() => {}}
                width="200px"
                variant="outline"
                borderColor="green.500"
                bg="white"
              >
                <div className="flex justify-items-center">
                  <Spinner size="sm"/>
                  <Text mx="2">
                    Uploading tokens
                  </Text>
                </div>
              </Button>
            </Tooltip>
          </SimpleGrid>
        )

        : (

          <Popover>
            <PopoverTrigger>
              <Button
                variant="outline"
                width="200px"
                border={"2px"}
                borderColor={newContractAdded ? "green.500" : "gray.400"}
                boxShadow="md"
                colorScheme={newContractAdded ? "green" : ""}
                bg="white"
              >
                Your NFT collections.
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />

              <Center>
                <PopoverHeader>Your NFT collections.</PopoverHeader>
              </Center>
              <PopoverBody>
              <Stack 
                maxH="400px"
                paddingBottom="8" 
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
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )
      }

      
    </Flex>
  )
}