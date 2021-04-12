import { 
  Box,
  Image, 
  Text, 
  Spinner, 
  AspectRatio,
  Center,
  Stack,
  Flex 
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
// import { Document, Page } from 'react-pdf';

interface ResponseBlob {
  src: string;
  skynetMetadata: Record<string, any>;
  ok: boolean;
}
interface ContentRendererProps {
  src: string;
  file: File | null
}

const renderContent = (rb: ResponseBlob, file: File | null = null) => {
  const { src, skynetMetadata } = rb;

  // console.log(skynetMetadata);
  const filename = skynetMetadata["filename"];
  const type = skynetMetadata["subfiles"][filename]["contenttype"] || "";

  if (type.indexOf("image") > -1) {
    return (
      <Image
        borderRadius="12px"
        height="300px"
        width="320px"
        src={src} 
      />
    )
  } else if (type.indexOf("video") > -1) {
    return (
      <AspectRatio width="320px" height="300px" borderRadius="12px">
        <video 
          src={src} 
          autoPlay 
          controls 
          loop 
        />
      </AspectRatio>
    );
  } else if (type.indexOf("pdf")) {
      return (
        // <Document file={file}>
        //   <Page />
        // </Document>
        <Text>
          PDF file to be rendered here.
        </Text>
      )
  }
  return <Text>Unsupported file format</Text>;
};

export const ContentRenderer: React.FC<ContentRendererProps> = ({ src, file=null }) => {
  const [response, setResponse] = useState<ResponseBlob | null>(null);

  useEffect(() => {
    const asyncFn = async () => {
      const response = await fetch(src);
      if (response.ok) {
        const skynetMetadata = JSON.parse(
          response.headers.get("skynet-file-metadata") || "{}"
        );

        // if the file is over 1mb, we're not waiting for it. we'll stream it instead
        let newSrc = src;
        if (skynetMetadata.length < 1 * 1000000) {
          newSrc = window.URL.createObjectURL(await response.blob());
        }
        setResponse({ src: newSrc, skynetMetadata, ok: response.ok });
      } else {
        setResponse({
          src,
          skynetMetadata: {},
          ok: response.ok,
        });
      }
    };
    asyncFn();
  }, [src]);

  return (
    <Box>
      {response ? (
        renderContent(response)
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
          <Stack>
            <Center>
                <p className="text-gray-400">
                  Rendering content
                </p>
            </Center>
            <Center>
              <Spinner />
            </Center>                                                
          </Stack>
        </Flex>
      )}
    </Box>
  );
};