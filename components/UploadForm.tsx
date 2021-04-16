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

  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuIcon,
  MenuCommand,
  MenuDivider,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

import { useDropzone } from "react-dropzone";
import { parseSkylink, SkynetClient } from "skynet-js";
import ethereum_address from 'ethereum-address';
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ContentWrapper } from './ContentWrapper';
import { ContentRenderer } from "./ContentRenderer"; 

import { uploadMetadataToSkynet } from "lib/skynet";
import { errorToast, successToast } from "lib/toast";

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
  const [files, setFiles] = useState<File[]>([]);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  // const [fileEffect, setFileEffect] = useState<boolean>(true);
  const [mediaSkylink, setMediaskylink] = useState<string>('');

  const [skylinkLoading, setSkylinkLoading] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txLoadingText, setTxLoadingText] = useState<string>('');

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [uploadType, setUploadType] = useState<string>('single token');
  const [tokenAmount, setTokenAmount] = useState<string>('');

  const toast = useToast();
  
  /// Set skynet portal
  useEffect(() => {
    const portal = "https://siasky.net/";
    skyPortalRef.current = new SkynetClient(portal);
  }, []);

  useEffect(() => {
    setFiles([...files, ...droppedFiles]);
    console.log("All files: ", files);
  }, [droppedFiles])

  useEffect(() => {
    const [file] = files;

    if(files.length > 1 && file !== mediaFile) {
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
      /// `uploadTokens` accepts an array of skylinks, even though we're uploading one at a time.
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
  
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

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
          {
            // Single token case: all remains the same
            // Multiple tokens : Add amount input -- non-blocking transactions (send email when all is done)
          }
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
                    {uploadType == "single token" 
                      ? "Choose file" 
                      : files.length > 0

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
                style={{visibility: (uploadType !== 'multiple tokens' ? "hidden" : "visible")}}
              >
                Amount
              </label>
              <Input
                hidden={uploadType !== 'multiple tokens'}                 
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                id="token-amount" 
                placeholder="E.g. 50"
              />

              <Button 
                onClick={uploadType == "single token" ? handleSingleTokenUpload : handleMultipleTokenUpload}
                // isDisabled={(contractAddress == '') || !ethereum_address.isAddress(contractAddress)} 
                isLoading={txLoading} 
                loadingText={txLoadingText}
              >
                Upload token to collection
              </Button>
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
              <Text hidden={files.length == 0}>
                Queued {files.length} {files.length == 1 ? "file" : "files"}. You can preview and upload them one after another.
              </Text>
              </Stack>  
          </SimpleGrid>  
        </Center>
      </ContentWrapper>
    </>
  )
}