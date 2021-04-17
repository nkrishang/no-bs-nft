import React, { useEffect, useState, useCallback, useRef } from 'react';

import {
  Button,
  Stack,
  Center,
  Input,
  Textarea,
  Flex,
  Spinner,
  Text,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';

import { useDropzone } from "react-dropzone";
import { parseSkylink, SkynetClient } from "skynet-js";
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ContentRenderer } from "./ContentRenderer"; 

import { uploadMetadataToSkynet } from "lib/skynet";
import { errorToast, successToast } from "lib/toast";

type SingleUploadProps = {
  uploadToken: any;
}

export default function SingleUpload({
  uploadToken
}: SingleUploadProps): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account } = context

  const skyPortalRef = useRef<any>();
  const [mediaSkylink, setMediaskylink] = useState<string>('');

  const [skylinkLoading, setSkylinkLoading] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txLoadingText, setTxLoadingText] = useState<string>('');

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const toast = useToast();
  
  /// Set skynet portal
  useEffect(() => {
    const portal = "https://siasky.net/";
    skyPortalRef.current = new SkynetClient(portal);
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {

    const [file] = acceptedFiles;
    handleMediaContent(file);
  }, []);

  const handleMediaContent = async (file: File) => {

    setImageSrc('');
    setSkylinkLoading(true);
    setMediaFile(file);

    try {
      const { skylink } = await skyPortalRef.current.uploadFile(file);
      const parsedSkylink: string | null = parseSkylink(skylink);

      setMediaskylink(skylink);
      setImageSrc(`https://siasky.net/${(parsedSkylink as string)}`);

    } catch (err) {
      console.log(err);
    }
    setSkylinkLoading(false);
  }

  const handleError = (err: any) => {
    errorToast(toast, "Sorry, something went wrong. Please try again");
    console.log(err)
  }

  const handleSingleTokenUpload = async () => {
    setTxLoadingText('Uploading to decentralised storage')
    setTxLoading(true);

    try {
      const metadataSkylink = await uploadMetadataToSkynet({
        name,
        description,
        image: mediaSkylink
      });

      console.log("Uploaded: ", metadataSkylink);
      setTxLoadingText('Minting');
      
      const tx = await uploadToken(account, metadataSkylink as string);
      console.log(tx);

      successToast(
        toast,
        "Your collection has been deployed! Scroll down for a link to the transaction."
      )
      setImageSrc("");

    } catch(err) {
      handleError(err);
    }

    setTxLoading(false);
    setTxLoadingText('');
  };
  
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>    
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
                Choose file
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
            placeholder="E.g. Dylan Field sold the zombie punk for millions."
          />

          <Button 
            onClick={handleSingleTokenUpload}                
            isLoading={txLoading} 
            loadingText={txLoadingText}
          >
            Upload token to your collection
          </Button>
        </Stack>

        {imageSrc ? (
            <ContentRenderer                                
                src={imageSrc}
                file={mediaFile}
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
                ? (
                    <Stack>
                    <Center>
                        <p className="text-gray-400">
                        Uploading to decentralized storage
                        </p>
                    </Center>
                    <Center>
                        <Spinner />
                    </Center>                                                
                    </Stack>                      
                    )
                : <Text variant="label" color="#333">Media preview</Text>
                }
            </Flex>
            )}                            
        </SimpleGrid>  
    </Center>
    </>
  )
}