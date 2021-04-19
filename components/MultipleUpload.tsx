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
} from '@chakra-ui/react';

import useUser from "lib/useUser";

import { useDropzone } from "react-dropzone";
import { parseSkylink, SkynetClient } from "skynet-js";
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ContentRenderer } from "./ContentRenderer"; 

import { uploadMetadataToSkynet } from "lib/skynet";
import { errorToast, successToast } from "lib/toast";

import UploadModal from "components/UploadModal";
import useGasPrice from 'lib/useGasPrice';
import { supportedIds } from 'lib/supportedIds';

type MultipleUploadProps = {
  NFT: any;
  contractAddress: string
}

export default function MultipleUpload({
  NFT,
  contractAddress 
}: MultipleUploadProps): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { chainId } = context

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
  const [tokensToUpload, setTokensToUpload] = useState<any>([]);

  const [estimatedCost, setEstimatedCost] = useState<string>('')

  const toast = useToast();
  // const { costEstimates } = useGasPrice(chainId as number || 1);

  const revertState = () => {
    setTotalFiles(0);
    setFiles([]);
    setDroppedFiles([]);

    setMediaFile(null);
    setMediaskylink('');

    setTokensToUpload([])
    setSkylinksToUpload([]);
  }

  // useEffect(() => {
  //   if(tokensToUpload.length > 0) {
      
  //     let numOfTxs = 0;
  //     for(let token of tokensToUpload) {
  //       numOfTxs += token.amount;
  //     }
  //     console.log("Num of txs: ", numOfTxs);
  //     const cost = 
  //     (costEstimates.uploadTransaction.length > 4 ? parseFloat(costEstimates.uploadTransaction.slice(0,4)) : parseFloat(costEstimates.uploadTransaction)
  //     ) * numOfTxs;
  //     console.log("COST: ", cost);
  //     setEstimatedCost(cost.toString());
  //   }
  // }, [tokensToUpload])

  /// Set skynet portal
  useEffect(() => {
    const portal = "https://siasky.net/";
    skyPortalRef.current = new SkynetClient(portal);
  }, []);

  useEffect(() => {
    setFiles([...files, ...droppedFiles]);
    setTotalFiles(totalFiles + droppedFiles.length);
    
  }, [droppedFiles])

  useEffect(() => {
    const [file] = files;
    
    if(file) {
      if(files.length > 0 && file !== mediaFile) {

        handleMediaContent(file);
      }
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
    setTxLoadingText('Uploading to decentralized storage')
    setTxLoading(true);

    try {
      const metadataSkylink = await uploadMetadataToSkynet({
        name,
        description,
        image: mediaSkylink
      });

      setSkylinksToUpload([...skylinksToUpload, metadataSkylink]);
      setTokensToUpload([
        ...tokensToUpload,
        {
          URI: metadataSkylink,
          amount: tokenAmount == '' ? 1 : parseInt(tokenAmount)
        }
      ])

      setName("");
      setDescription("");
      setTokenAmount('');

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
  const { isOpen, onOpen, onClose } = useDisclosure()
  
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
              placeholder="E.g. 1 (by default)"
            />
            <Stack>
              <Button 
                onClick={totalFiles != 0 && skylinksToUpload.length == totalFiles
                  ? onOpen
                  : handleMultipleTokenUpload
                }
                isDisabled={(contractAddress == '' || totalFiles == 0 || (tokenAmount != '' && isNaN(parseInt(tokenAmount))) )} 
                border={(totalFiles != 0 && skylinksToUpload.length == totalFiles) ? "2px" : ""}
                borderColor={(totalFiles != 0 && skylinksToUpload.length == totalFiles) ? "green.500" : ""}
                isLoading={txLoading} 
                loadingText={txLoadingText}
              >
                {files.length == 0 || skylinksToUpload.length == files.length
                  ? "Upload all tokens to your NFT collection"
                  : `Prepare token ${skylinksToUpload.length + 1} of ${totalFiles} for collection`
                }
              </Button>
              {/* <Text>
                {chainId
                  ? totalFiles == 0 || skylinksToUpload.length == 0
                    ? `Est. cost of uploading 1 token on ${supportedIds[chainId as number].name}: ${costEstimates.uploadTransaction} USD`
                    : `Est. total cost of uploading on ${supportedIds[chainId as number].name}: ${estimatedCost} USD`
                  : ""
                }
              </Text> */}
            </Stack>
            
            <UploadModal 
              NFT={NFT}
              contractAddress={contractAddress}
              transactions={tokensToUpload}
              modalParams={{
                isOpen: isOpen,                
                onClose: onClose
              }}
              onSuccessfulTx={revertState}
            />
            
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
                  : `Queued ${files.length} ${files.length == 1 ? "file" : "files"}. You can preview and upload files one after another.`
              }
            </Text>
            </Stack>  
        </SimpleGrid>  
      </Center>
    </>
  )
}