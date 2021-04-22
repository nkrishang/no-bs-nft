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
import useGasPrice from 'lib/useGasPrice';
import { useEffect, useState } from 'react';


export default function App(): JSX.Element {
  
  // const { getCost } = useGasPrice();

  const [uploadCost, setUploadCost] = useState<any>('')
  const [deployCost, setdeployCost] = useState<any>('')

  // useEffect(() => {
  //   const getPrices = async () => {
  //     const { uploadCost, deployCost } = await getCost()

  //     if(parseFloat(uploadCost.eth) > 0 && parseFloat(uploadCost.matic) > 0) {
  //       setUploadCost(uploadCost);
  //     }

  //     if(parseFloat(deployCost.eth) > 0 && parseFloat(deployCost.matic) > 0) {
  //       setdeployCost(deployCost)
  //     }

  //     console.log(uploadCost, deployCost)
  //   }

  //   getPrices();
  // }, [])

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
                <Stack>
                  <p className="text-lg text-gray-800 font-light text-center mb-2">
                    We're on Ethereum Mainnet and Matic (Polygon)
                  </p>                                   
                  <span className="text-center">                
                    Create an NFT collection on Matic (est.): <span className="text-green-600 font-normal">${
                      deployCost ? deployCost.matic : '0.3'
                    }</span>
                  </span>
                  <span className="text-center">                  
                    Upload 1 media file to an NFT collection on Matic (est.): <span className="text-green-600 font-normal">${
                      uploadCost ? uploadCost.matic : '0.0001'
                    }</span>
                  </span>
                </Stack>
              </Center>

              <Center>
                <div className="mb-16 mt-8">
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