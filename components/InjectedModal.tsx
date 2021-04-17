import {
  Text,
  Button,
  Stack
} from "@chakra-ui/react"

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useEffect, useLayoutEffect, useRef, useState } from "react"

export default function InjectedModal({txParams, onSuccessfulTx}: any): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account, library } = context

  const [loading, setLoading] = useState<boolean>(false)
  const [loadingText, setLoadingText] = useState<string>('');

  const [numOfTransactions, setNumOfTransactions] = useState<number>(0);

  const getNumOfTransactions = (): number => {
    
    if(txParams.transactions.length == 0) return 0;
    
    let num = 0;
    for(const token of txParams.transactions) {
      num += token.amount;
    }
    
    return num;
  }

  useEffect(() => {
    const num: number = getNumOfTransactions();
    setNumOfTransactions(num);
  })
  

  const uploadTokensTransaction = async (library: any, account: any) => {
    
    setLoadingText("Uploading tokens")
    setLoading(true)
    
    const { transactions, uploadToken } = txParams;
    const numOfTokens = transactions.length
    let txNumber = 1;

    let txNonce = await library.getSigner(account).getTransactionCount()
    for(let i = 0; i < numOfTokens; i++) {

      const { URI, amount } = transactions[i];
      
      for(let j = 1; j <= amount; j++) {
        setLoadingText(`Uploading token ${i + 1} of ${numOfTokens}. (Transaction ${txNumber} of ${numOfTransactions})`)

        await uploadToken(account, URI, txNonce)

        txNumber++
        txNonce++
      }
      
      onSuccessfulTx();
      setLoading(false)
    }
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
        >
          Upload all tokens to your NFT collection
        </Button>
      </Stack>
    </>
  )
}