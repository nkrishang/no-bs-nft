import React, { useContext, useEffect, useState } from 'react';
import {
  Text,
  Button,
  Input,
  Stack,
  HStack,
  useToast,
} from "@chakra-ui/react"

import useUser from 'lib/useUser';

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';
import { supportedIds } from "lib/supportedIds";
import { errorToast } from 'lib/toast';
import { ContractContext } from 'lib/AppContext';

export default function MagicModal({magicLoading, handleMagicError, handleTransaction, magicLoadingText, magicSuccess}: any): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { chainId } = context

  const { user, login, logout } = useUser();
  const [email, setEmail] = useState<string>('');

  const [loadingText, setLoadingText] = useState<string>('');
  const [logoutLoading, setLogoutLoading] = useState<boolean>(false)
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const [magicSigner, setMagicSigner] = useState<any>('');

  const toast = useToast();

  const { uploadTokenLoading } = useContext(ContractContext);

  useEffect(() => {
    console.log("USER EMAIL: ", user?.email);
    console.log("USER PUBLIC ADDR: ", user?.publicAddress)

    if(user?.isLoggedIn) {
      // console.log("Checking logged in user")
      setEmail(user.email as string)
      setLoginLoading(false)
    }

    // console.log("Checking")
  }, [user])

  useEffect(() => {
    if(chainId) {
      console.log("ENS name: ", supportedIds[chainId as number].url)
      let magic: any;
      
      try {
        magic = new Magic("pk_live_5F8BDFD9AA53D653", {
          network: {
            rpcUrl: supportedIds[chainId as number].url,
            chainId: chainId
          }
        })
      } catch(err) {
        console.log(err)
        errorToast(
          toast,
          "Something went wrong. Please contact krishang@nftlabs.co for support, or try again."
        )
        return
      }

      console.log("Getting provider for chainId: ", chainId)

      const rpc: any = magic.rpcProvider
      const provider = new ethers.providers.Web3Provider(rpc);
      const signer = provider.getSigner();

      // console.log("Got signer: ", signer)
      setMagicSigner(signer);
    }
  }, [chainId, user])



  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await logout();
    } catch(err) {
      handleMagicError(err);
    }
    setLogoutLoading(false)
  }

  const handleLogin = async (email: string) => {
    setLoadingText("Getting your magic link wallet. This may take a second.");
    setLoginLoading(true)
    let success
    try {
      success = await login(email);
    } catch(err) {
      handleMagicError(err);
    }

    if(success) {
      console.log("LOGIN SUCCESS")
      
    } else {
      console.log("LOGIN UNSUCCESSFUL")
      setLoginLoading(false)
      
    }
    setLoadingText("");
  }

  function validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

<<<<<<< HEAD
  const uploadTokensTransaction = async (library: any, account:any) => {

    setLoadingText("Deposit transaction cost in magic wallet")
    setLoading(true);

    let ethToPay;

    try {
      const etherForOneUpload = (parseInt(gasPrice) * gasEstimates.uploadTransaction) / 10**9; // eth value
      // console.log("Ether for one upload: ", etherForOneUpload);
      let numOfTxs = 0;
      for(let token of transactions) {
        numOfTxs += token.amount;
      }
      
      const totalEther = etherForOneUpload * numOfTxs;
      ethToPay = totalEther.toString();
      // console.log("Gas to pay in ETH: ", totalEther.toString());
    } catch(err) {
      handleError(err)
      return
    }
    console.log("ETH/MATIC to pay: ", ethToPay);
    try {
      // console.log("Sending ether to magic link wallet")
      const tx1 = await library.getSigner(account as string).sendTransaction({
        to: user?.publicAddress as string,
        value: ethers.utils.parseEther(ethToPay as string),
      })
      
      await tx1.wait()
      console.log("Transaction 1: ", tx1.hash);
    } catch(err) {
      handleError(err)
      return
    }

    try {
      // console.log(`Granting address ${user?.publicAddress} minter role`);
      setLoadingText("Give magic wallet permission to upload tokens ")

      const tx2 = await contract.grantMinterRole(user?.publicAddress as string, {
        gasLimit: 1000000,
        // nonce: txNonce_injected
      });
      await tx2.wait();
      setLoadingText("Giving magic wallet permission to upload tokens ")
      console.log("Transaction 2: ", tx2.hash);
    } catch(err) {
      handleError(err)
      return
    }
    
    let txNonce_magic = parseInt((await magicSigner.getTransactionCount()).toString());
    setLoadingText("Uploading tokens. This might take a minute.")
    console.log("TX COUNTS: ", parseInt((await magicSigner.getTransactionCount()).toString()));

    let finaltx
    try {
      for(let i = 0; i < transactions.length; i++) {    
        const { URI, amount } = transactions[i];
        
        for(let j = 1; j <= amount; j++) {
          console.log("Helllllo")
                          

          const tx = magicContract.mint(user?.publicAddress as string, URI, {
            gasLimit: gasEstimates.uploadTransaction,
            nonce: txNonce_magic,
            gasPrice: ethers.utils.parseUnits(gasPrice, "gwei")
          })
          txNonce_magic++;

          if(i == transactions.length - 1 && j == amount) {    
            finaltx = tx;
            console.log("Final tx before: ", finaltx)
            setLoadingText("Your transactions are being mined. Don't close this window.")
            await finaltx;
            console.log("Final tx after: ", finaltx)

            fetch("/api/magicUpload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user?.email,
                publicAddress: user?.publicAddress,
                contractAddress: contractAddress,
                chainId: chainId,
                txNonce: txNonce_magic
              })
            })
          }
        }
      }
      // fetch("/api/email", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     email: user?.email,
      //     txHash: "dummytxhash",
      //     contractAddress: contractAddress,
      //     chainId: chainId
      //   })
      // })

    } catch(err) {
      handleError(err)
      return
    }
    setSuccess(true);
    onSuccessfulTx();
    setLoading(false)
    setLoadingText('')
  }

=======
>>>>>>> development
  return (
    <>
      <Text my="2">
        {`
          We ask you to deposit the total (estimated) transaction cost into your
          non-cutodial magic link wallet.
        `}
      </Text>

      <Text my="2">
        {`
          We will send you an email once all your tokens
          have been uploaded to your collection.
        `}
      </Text>

      <p className="text-green-700 text-base my-2" style={{display: !uploadTokenLoading ? "none" : ""}}>
        {`
          Please don't close the browser window until the loading indicator in the bottom right corner disappears.
        `}
      </p>
      
      <HStack my="4">
        <Input
          value={email}
          isReadOnly={user?.isLoggedIn}
          isInvalid={email != '' && !validateEmail(email)}
          errorBorderColor={"crimson"}
          onChange={(e) => setEmail(e.target.value)}
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
        <Button
          size="sm"
          variant="ghost"
          hidden={!user?.isLoggedIn}
          onClick={handleLogout}
          isLoading={logoutLoading}
        >
          Use a different email.
        </Button>
      </HStack>
      
      <Stack>
        <Button
          mt={user?.isLoggedIn ? "4" : ""} 
          onClick={user?.isLoggedIn ? () => handleTransaction(user.publicAddress, user.email, magicSigner) : () => handleLogin(email)}
          isLoading={loginLoading || magicLoading}
          loadingText={loadingText || magicLoadingText}
          colorScheme={magicSuccess ? "green" : "gray"}
          isDisabled={magicSuccess || (!user?.isLoggedIn && !validateEmail(email))}
        >
          {magicSuccess
            ? `We'll email you when all's done.`
            : user?.isLoggedIn
              ? "Upload all tokens to your NFT collection" 
              : "Submit email"}
        </Button>
      </Stack>
      
    </>
  )
}