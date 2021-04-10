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
  SimpleGrid
} from '@chakra-ui/react';
import { useDropzone } from "react-dropzone";
import { parseSkylink, SkynetClient } from "skynet-js";

import { ContentWrapper } from './ContentWrapper';


type UploadFormProps = {
  uploadMoment: any
}

export default function UploadForm({uploadMoment}: UploadFormProps): JSX.Element {

  const skyPortalRef = useRef<any>();

  const [skylinkLoading, setSkylinkLoading] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>('');

  const [transactions, setTransactions] = useState<string[]>([]);

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
        image: `https://siasky.net/${mediaSkylink}`,
      };

      const blob: BlobPart = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });

      const metadataFile = new File([blob], "example.json");

      try {
        const { skylink } = await skyPortalRef.current.uploadFile(metadataFile);
        const parsedSkylink: string | null = parseSkylink(skylink);
        console.log("Metadata Skylink: ", parsedSkylink);

        return parsedSkylink;
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
      setImageSrc(parsedSkylink as string);
    } catch (err) {
      console.log(err);
    }

    setSkylinkLoading(false);
  }, []);

  const handleMomentUpload = async () => {
    setTxLoading(true);

    const metadataSkylink = await uploadMetadataToSkynet(imageSrc);
    console.log("Uploaded: ", metadataSkylink);

    /// `uploadMoments` accepts an array of skylinks, even though we're uploading one at a time.
    const tx = await uploadMoment([metadataSkylink as string]);
    setTransactions([...transactions, tx]);

    setName("");
    setDescription("");
    setImageSrc("");
    setTxLoading(false);
  };


  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <ContentWrapper>
        <Center className="mt-8">

          <SimpleGrid columns={2} spacingX={"100px"}>

            <Stack>
              <Flex
                mt="32px"
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
              <Input id="collection-name" placeholder="E.g. 'Zombie Punk'"/>

              <label htmlFor="collection-name">Description</label>
              <Textarea id="collection-symbol" placeholder="E.g. Dylan Field sold the zobie punk for millions."/>

              <Button onClick={handleMomentUpload} isLoading={txLoading}>
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
                  <Text variant="label" color="#333">
                    {skylinkLoading ? <Spinner /> : "Image preview"}
                  </Text>
                </Flex>
              )}
          </SimpleGrid>  
        </Center>
      </ContentWrapper>
    </>
  )
}