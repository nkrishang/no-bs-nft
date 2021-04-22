
import {
  Center, 
  Link, 
  Tooltip,
  useClipboard,
  Flex, 
  HStack
} from '@chakra-ui/react'
import { ExternalLinkIcon, CopyIcon } from "@chakra-ui/icons";
import { supportedIds } from "lib/supportedIds";

export default function NFTRow({NFTAddress, chainId}: any): JSX.Element {

  const { hasCopied, onCopy } = useClipboard(NFTAddress || "");

  return (
    <Center>
      <div className="flex justify-between" style={{width: "200px"}}>
        <Tooltip
          label={hasCopied ? "Copied!" : "Copy to Clipboard"}
          color="white"
          bg="black"
        >
          <Flex
            onClick={onCopy}
            borderRadius="8px"
            direction="column"
            align="center"
            justify="center"
            cursor="pointer"
            _hover={{
              bg: "#EEE",
            }}
          >
            <HStack>
              <CopyIcon/> 
              <p>
                {NFTAddress.slice(0,6) + "..." + NFTAddress.slice(-3)}
              </p>              
            </HStack>
          </Flex>
        </Tooltip>
        <Link href={supportedIds[chainId].contractExplorer + NFTAddress} isExternal>
          <HStack>
            <p>
              Code
            </p>
            <ExternalLinkIcon />
          </HStack>
        </Link>
      </div>
    </Center>
  )
}