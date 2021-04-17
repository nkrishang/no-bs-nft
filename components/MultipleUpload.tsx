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
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

import useUser from "lib/useUser";

import { useDropzone } from "react-dropzone";
import { parseSkylink, SkynetClient } from "skynet-js";
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ContentRenderer } from "./ContentRenderer"; 

import { uploadMetadataToSkynet } from "lib/skynet";
import { errorToast, successToast } from "lib/toast";

type MultipleUploadProps = {
  uploadToken: any;
}

export default function MultipleUpload({
  uploadToken 
}: MultipleUploadProps): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account } = context

  // MAGIC LINK LOGIC

  const { user, login } = useUser();

  useEffect(() => {
    // Once you get user, save public key in state and use that for non custodial transactions
  }, [user])

  const skyPortalRef = useRef<any>();
  const [files, setFiles] = useState<File[]>([]);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [mediaSkylink, setMediaskylink] = useState<string>('');
  

  const [skylinkLoading, setSkylinkLoading] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txLoadingText, setTxLoadingText] = useState<string>('');

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [skylinksToUpload, setSkylinksToUpload] = useState<string[]>([]);
  const [tokensToUpload, setTokensToUplaod] = useState<any>([]);
  
  const [email, setEmail] = useState<string>('');

  const toast = useToast();
  
  /// Set skynet portal
  useEffect(() => {
    const portal = "https://siasky.net/";
    skyPortalRef.current = new SkynetClient(portal);
  }, []);

  useEffect(() => {
    setFiles([...files, ...droppedFiles]);
    setTotalFiles(totalFiles + droppedFiles.length);
    console.log("All files: ", files);
  }, [droppedFiles])

  useEffect(() => {
    const [file] = files;
    console.log("Total files: ", totalFiles)
    
    if(files.length > 0 && file !== mediaFile) {
      console.log("Hello")
      handleMediaContent(file);
    }
    
  }, [files])

  const onDrop = useCallback(async (acceptedFiles) => {

    setDroppedFiles([...acceptedFiles]);
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

  const nextMediaContent = async () => {
    if(files.length > 1) {
      const updatedFiles = files.slice(1);
      setFiles([...updatedFiles]);
      
      return updatedFiles
    } else {
      setFiles([]);
      setName("");
      setDescription("");
      setImageSrc("");
    }
  }

  const handleError = (err: any) => {
    errorToast(toast, "Sorry, something went wrong. Please try again");
    console.log(err)
  }

  const handleMultipleTokenUpload = async () => {
    setTxLoadingText('Uploading to decentralised storage')
    setTxLoading(true);

    try {
      const metadataSkylink = await uploadMetadataToSkynet({
        name,
        description,
        image: mediaSkylink
      });

      // Handle tx logic here
      setSkylinksToUpload([...skylinksToUpload, metadataSkylink]);
      setTokensToUplaod([
        ...tokensToUpload,
        {
          URI: metadataSkylink,
          amount: tokenAmount
        }
      ])

      setName("");
      setDescription("");

      const updatedFiles = await nextMediaContent();

      if(updatedFiles) {
        if((updatedFiles as File[]).length > 0) {
          const [file]: any = updatedFiles;
          await handleMediaContent(file);
        }
      }
      
      console.log("Uploaded: ", metadataSkylink);
    } catch (err) {
      handleError(err);
    }

    setTxLoading(false);
    setTxLoadingText('');
  }

  const uploadTokensTransaction = async () => {

  }
  
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const { isOpen, onOpen, onClose } = useDisclosure()

  function validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

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

                  {files.length > 0
                    ? "Add one or more files"
                    : "Choose one or more files"
                  }
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

            <label
              htmlFor="token-amount"                
            >
              Amount
            </label>
            <Input                
              isInvalid={tokenAmount != '' && isNaN(parseInt(tokenAmount))}
              errorBorderColor="crimson"                 
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              id="token-amount" 
              placeholder="E.g. 50"
            />
            <Button 
              onClick={handleMultipleTokenUpload}
              // isDisabled={(contractAddress == '') || !ethereum_address.isAddress(contractAddress)} 
              border={(totalFiles != 0 && skylinksToUpload.length == totalFiles) ? "2px" : ""}
              borderColor={(totalFiles != 0 && skylinksToUpload.length == totalFiles) ? "green.500" : ""}
              isLoading={txLoading} 
              loadingText={txLoadingText}
            >
              {files.length == 0 || skylinksToUpload.length == files.length
                ? "Upload all tokens to collection"
                : `Prepare token ${skylinksToUpload.length + 1} of ${totalFiles} for collection`
              }
            </Button>

            <Button onClick={onOpen} hidden={!(totalFiles != 0 && skylinksToUpload.length == totalFiles)}>
              Get notified when your tokens are uploaded.
            </Button>

            <Modal
              isOpen={isOpen}
              onClose={onClose}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Get notified.</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                  <Text color="#999" mt="12px" fontSize="14px">
                    {`Uploading multiple tokens can take time. We ask for your email to notify you when your tokens are uploaded.`}
                  </Text>

                  <Text color="#999" mt="12px" fontSize="14px">
                    {`Under the hood: your email will be used to create a secure, magic link wallet for you, so that you won't
                      need to confirm every single transaction with Metamask
                    `}
                  </Text>
                  
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    mt="32px"
                    border="none"
                    fontWeight="normal"
                    width="300px"
                    borderBottom="2px solid #333 !important"
                    borderRadius="0px"
                    placeholder="krishang@nftlabs.co"
                    _focus={{
                      borderBottom: "2px solid #666 !important",
                    }}
                  />                  
                </ModalBody>

                <ModalFooter>
                  <Button type="submit" mr="3" onClick={() => login(email)}>
                    Submit email
                  </Button>
                  <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Stack>
          <Stack>
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
            <Text>               
              {totalFiles == 0
                ? ""
                : skylinksToUpload.length == totalFiles

                  ? "All tokens prepared for your collection!"
                  : `Queued ${files.length} ${files.length == 1 ? "file" : "files"}. You can preview and upload them one after another.`
              }
            </Text>
            </Stack>  
        </SimpleGrid>  
      </Center>
    </>
  )
}