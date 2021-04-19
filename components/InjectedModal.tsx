import {
  Text,
  Button,
  Stack,
  useToast
} from "@chakra-ui/react"

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useEffect, useState } from "react"
import { ethers } from "ethers"

import { errorToast } from "lib/toast";

export default function InjectedModal({contractAddress, NFT, transactions, onSuccessfulTx}: any): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account, library } = context

  const [loading, setLoading] = useState<boolean>(false)
  const [loadingText, setLoadingText] = useState<string>('');

  const [contract, setContract] = useState<any>('');
  const [numOfTransactions, setNumOfTransactions] = useState<number>(0);

  const [success, setSuccess] = useState<boolean>(false);

  const toast = useToast();

  const getNumOfTransactions = (): number => {
    
    if(transactions.length == 0) return 0;
    
    let num = 0;
    for(const token of transactions) {
      num += token.amount;
    }
    
    return num;
  }

  useEffect(() => {
    const num: number = getNumOfTransactions();
    setNumOfTransactions(num);
  })

  useEffect(() => {
    if(library && account) {
      try {
        const nftContract = new ethers.Contract(contractAddress, NFT.abi, library?.getSigner(account as string))
        setContract(nftContract);
      } catch(err) {
        console.log(err)
        return
      }
    }
    
  }, [contractAddress, NFT, library, account])

  const handleError = (err: any) => {
    setLoading(false)
    setLoadingText('')
    errorToast(
      toast,
      "Something went wrong. Please try again."
    )
    console.log(err);
  }
  

  const uploadTokensTransaction = async (library: any, account: any) => {
    
    setLoadingText("Uploading tokens")
    setLoading(true)

    const numOfTokens = transactions.length
    let txNumber = 1;

    let txNonce = await library.getSigner(account).getTransactionCount()
    for(let i = 0; i < numOfTokens; i++) {

      const { URI, amount } = transactions[i];
      
      for(let j = 1; j <= amount; j++) {
        setLoadingText(`Uploading token ${i + 1} of ${numOfTokens}. (Transaction ${txNumber} of ${numOfTransactions})`)

        try {
          const tx = await contract.mint(account, URI, {
            gasLimit: 1000000,
            nonce: txNonce
          });
          await tx.wait()
          txNumber++
          txNonce++

          console.log("TX hash: ", tx.hash);
        } catch(err) {
          handleError(err)
          return
        }      
      }      
    }

    setSuccess(true);
    onSuccessfulTx();
    setLoading(false)
  }
  return (
    <>
      <Text mt="2" mb="8">
        {
          `You will have to wait and confirm ${numOfTransactions} transactions to upload your tokens to your collection.`
        }
      </Text>

      <Stack>
        <Button 
          onClick={() => uploadTokensTransaction(library, account)}
          isLoading={loading}
          loadingText={loadingText}
          colorScheme={success ? "green" : "gray"}
          isDisabled={success}
        >
          {success
            ? `All tokens have been uploaded to your NFT collection!`
            : "Upload all tokens to your NFT collection"
          }
        </Button>
      </Stack>
    </>
  )
}