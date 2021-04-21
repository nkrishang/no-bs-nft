import { 
  Button, 
  useToast, 
  useDisclosure,
  Stack,
  HStack,
  Tooltip,
  useClipboard,
  Text, 
  Flex,
  Link,
  Center,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';

import NFTRow from "components/NFTRow";

export default function CollectionList({NFTs}: any): JSX.Element {

  return (
    <Flex
      position="fixed"
      bottom="24px"
      right="72px"
      height="70px"
      bg="white"
      borderRadius="50px"
      cursor="pointer"
      align="center"
      justify="center"
      zIndex="100"
    >
      <Popover>
        <PopoverTrigger>
          <Button
            variant="outline"
            width="200px"
            border="2px"
            borderColor="gray.400"
            boxShadow="md"
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
            paddingBottom="16" 
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
    </Flex>
  )
}