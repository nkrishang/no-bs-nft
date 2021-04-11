import React, { useEffect, useState, useCallback, useRef } from 'react';

import {
  Button,
  Stack,
  Center,
  Input,
  Textarea,
  Flex,
  Image,
  Spinner,
  Text,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';
import { useDropzone } from "react-dropzone";
import { parseSkylink, SkynetClient } from "skynet-js";
import ethereum_address from 'ethereum-address';
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ContentWrapper } from './ContentWrapper';


type UploadFormProps = {
  uploadToken: any;
  
  contractAddress: string;
  setContractAddress: any;
}

export default function UploadForm({
  uploadToken, 
  contractAddress, 
  setContractAddress
}: UploadFormProps): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account } = context

  const skyPortalRef = useRef<any>();

  const [skylinkLoading, setSkylinkLoading] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txLoadingText, setTxLoadingText] = useState<string>('');

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>('');
  const [mediaSkylink, setMediaskylink] = useState<string>('');

  const toast = useToast();
  
  /// Set skynet portal
  useEffect(() => {
    const portal = "https://siasky.net/";
    skyPortalRef.current = new SkynetClient(portal);
  }, []);

  /// Uploads metadata json to skynet
  const uploadMetadataToSkynet = useCallback(
    async (mediaSkylink: string | null) => {
      const metadata = {
        name: name,
        description: description,
        image: mediaSkylink,
      };

      const blob: BlobPart = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });

      const metadataFile = new File([blob], "example.json");

      try {
        const { skylink } = await skyPortalRef.current.uploadFile(metadataFile);
        
        console.log("Metadata Skylink: ", skylink);

        return skylink;
      } catch (err) {
        console.log(err);
      }
    },
    [name, description]
  );

  const onDrop = useCallback(async (acceptedFiles) => {
    setSkylinkLoading(true);

    const [file] = acceptedFiles;

    try {
      const media = await skyPortalRef.current.uploadFile(file);
      const parsedSkylink: string | null = parseSkylink(media.skylink);
      setMediaskylink(media.skylink);
      setImageSrc(parsedSkylink as string);
    } catch (err) {
      console.log(err);
    }

    setSkylinkLoading(false);
  }, []);


  const handleAddressInput = (addr: string) => {
    setContractAddress(addr)
  }

  const handleMomentUpload = async () => {
    setTxLoadingText('Uploading to decentralised storage')
    setTxLoading(true);

    try {
      const metadataSkylink = await uploadMetadataToSkynet(mediaSkylink);
      console.log("Uploaded: ", metadataSkylink);
      setTxLoadingText('Minting');
      /// `uploadTokens` accepts an array of skylinks, even though we're uploading one at a time.
      const tx = await uploadToken(account, metadataSkylink as string);
      console.log(tx);
      toast({
        title: "Your collection has been deployed! Scroll down for a link to the transaction.",
        status: "success",
        variant: "subtle",
        duration: 10000,
        isClosable: true,
      });

      setName("");
      setDescription("");
      setImageSrc("");
    } catch(err) {

      toast({
        title: "Sorry, something went wrong. Please try again",
        status: "error",
        variant: "subtle",
        duration: 10000,
        isClosable: true,
      });
      console.log(err)
    }

    setTxLoading(false);
    setTxLoadingText('');
  };
  
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <ContentWrapper>

        <Center mt="16px">
          <>
            <label htmlFor="contract-address" className="mr-4">Contract:</label>
            <Input 
              value={contractAddress}
              isInvalid={!(contractAddress == '') && !ethereum_address.isAddress(contractAddress)}
              errorBorderColor="crimson"
              borderColor={ethereum_address.isAddress(contractAddress) ? "green.300" : ""}
              width="320px" 
              id="contract-address"
              onChange={(e) => handleAddressInput(e.target.value)}
              placeholder={"Enter ERC721 contract address"}
            />
          </>
        </Center>
        <Center className="mt-8">

          <SimpleGrid columns={2} spacingX={"100px"}>

            <Stack>

              <Flex
                // mt="32px"
                mb="8px"
                bg="transparent"
                borderRadius="12px"
                border="2px dashed #333"
                height="160px"
                width="400px"
                align="center"
                justify="center"
                direction="column"
              >
                <Flex {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Button
                    color="#444"
                    borderRadius="25px"
                    mt="8px"
                    boxShadow="none !important"
                  >
                    Choose File
                  </Button>
                </Flex>
              </Flex>

              

              <label htmlFor="collection-name">Name</label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="collection-name" 
                placeholder="E.g. 'Zombie Punk'"
              />

              <label htmlFor="collection-name">Description</label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)} 
                id="collection-symbol" 
                placeholder="E.g. Dylan Field sold the zobie punk for millions."
              />

              <Button onClick={handleMomentUpload} isLoading={txLoading} loadingText={txLoadingText}>
                Mint
              </Button>
            </Stack>  
            {imageSrc ? (
                <Image               
                  borderRadius="12px"
                  height="300px"
                  width="320px"
                  src={`https://siasky.net/${imageSrc}`}
                />
              ) : (
                <Flex              
                  height="300px"
                  width="320px"
                  bg="transparent"
                  borderRadius="12px"
                  border="2px dashed #333"
                  align="center"
                  justify="center"
                  direction="column"
                >
                  {skylinkLoading
                    ? <Spinner />
                    : <Text variant="label" color="#333">Image preview</Text>
                  }
                </Flex>
              )}
          </SimpleGrid>  
        </Center>
      </ContentWrapper>
    </>
  )
}