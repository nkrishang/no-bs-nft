
import {
  Center, 
  Link, 
  SimpleGrid, 
  Stack,
  Tooltip,
  useClipboard,
  Text,
  Flex,
  Badge,
  Box 
} from '@chakra-ui/react'
import { ExternalLinkIcon } from "@chakra-ui/icons";
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
            {NFTAddress.slice(0,6) + "..." + NFTAddress.slice(-6)}
          </Flex>
        </Tooltip>
        <Link href={supportedIds[chainId].contractExplorer + NFTAddress} isExternal>
          Code <ExternalLinkIcon />
        </Link>
      </div>
    </Center>
  )
}