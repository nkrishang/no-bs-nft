import Image from 'next/image';

import {
  Center, 
  HStack, 
  Link, 
  Stack,
  Button
} from '@chakra-ui/react'
import { InfoOutlineIcon, ArrowRightIcon } from "@chakra-ui/icons";

import { ContentWrapper } from 'components/ContentWrapper';


export default function App(): JSX.Element {
  

  return (
    <>      
      <ContentWrapper>
        <Stack className="mt-16">
          <Center mb="4">
            <Stack>
              <Center>
                <p className="text-8xl font-black mb-4">
                  No bullshit NFT.
                </p>   
              </Center>          
              <Center>
                <p  className="text-3xl font-light center mb-8">
                  Mint and manage an NFT collection without the extra platform bullshit.
                </p>
              </Center>

              <Center>
                <div className="mb-16">
                  <Link href="/create">
                    <Button variant="link" rightIcon={<ArrowRightIcon boxSize="0.75em"/>}>                    
                      <p className="text-gray-700 font-light text-lg">
                        Create an NFT collection
                      </p>                 
                    </Button>
                  </Link>
                </div>
              </Center>

              <Center>
                <HStack spacing="16">
                  <Link href="https://discord.gg/baNTHHBD36" isExternal>
                    <HStack spacing="4">
                      <Image
                        src="/discord-logo.png"
                        width={24}
                        height={24}
                        priority={true}
                      />
                      <p>
                        Join us on Discord
                      </p>
                    </HStack>                                      
                  </Link>

                  <Link href="https://github.com/nkrishang/no-bs-nft" isExternal>
                    <HStack spacing="4">
                      <Image
                        src="/github-logo.png"
                        width={24}
                        height={24}
                        priority={true}
                      />
                      <p>
                        Source code
                      </p>
                    </HStack>                                      
                  </Link>

                  <Link href="https://www.notion.so/No-BS-NFTs-8f2b9490317e426587ef038b56e0bc8c" isExternal>
                    <HStack spacing="4">
                      {/* <Image
                        src="/github-logo.png"
                        width={64}
                        height={64}
                      /> */}
                      <InfoOutlineIcon />
                      <p>
                        Docs
                      </p>
                    </HStack>                                      
                  </Link>
                </HStack>
              </Center>
            </Stack>        
          </Center>
        </Stack>
      </ContentWrapper>
    </>
  )
}