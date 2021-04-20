import React, { useEffect, useState } from 'react';
import {
  Text,
  Button,
  Input,
  Stack,
  HStack,
  useToast
} from "@chakra-ui/react"

import useUser from 'lib/useUser';

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';
import useGasPrice from 'lib/useGasPrice';
import { supportedIds } from "lib/supportedIds";
import { errorToast } from 'lib/toast';

export default function MagicModal({transactions, NFT, contractAddress, onSuccessfulTx}: any): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account, library, chainId } = context

  const { user, login, logout } = useUser();
  const [email, setEmail] = useState<string>('');

  const [contract, setContract] = useState<any>('');
  const [magicContract, setMagicContract] = useState<any>('');
  const [magicSigner, setMagicSigner] = useState<any>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [logoutLoading, setLogoutLoading] = useState<boolean>(false)
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const [check, setCheck] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const { gasPrice, gasEstimates } = useGasPrice(chainId as number || 1);

  const toast = useToast();

  useEffect(() => {
    console.log("USER EMAIL: ", user?.email);
    console.log("USER PUBLIC ADDR: ", user?.publicAddress)

    if(user?.isLoggedIn) {
      console.log("Checking logged in user")
      setEmail(user.email as string)
      setLoginLoading(false)
    }

    console.log("Checking")
  }, [user, check])

  useEffect(() => {
    let magic: any;
    console.log("Getting provider for chainId: ", chainId)
    // magic key
    switch(chainId) {
      case 1:
        magic = new Magic("pk_live_5F8BDFD9AA53D653")
        break;
      case 3:
        console.log("ROPSTEN PROVIDER")
        magic = new Magic("pk_live_5F8BDFD9AA53D653", {
          network: {
            rpcUrl: supportedIds[chainId].url,
            chainId: chainId
          }
        })
        break;
      case 137:
        magic = new Magic("pk_live_5F8BDFD9AA53D653", {
          network: {
            rpcUrl: supportedIds[chainId].url,
            chainId: chainId
          }
        });
        break;
      case 80001:
        magic = magic = new Magic("pk_live_5F8BDFD9AA53D653", {
          network: {
            rpcUrl: supportedIds[chainId].url,
            chainId: chainId
          }
        });
        break;
      default:
        magic = new Magic("pk_live_5F8BDFD9AA53D653")
        break;
    }

    const rpc: any = magic.rpcProvider
    const provider = new ethers.providers.Web3Provider(rpc);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(contractAddress, NFT.abi, signer);
    console.log("Got signer: ", signer)
    setMagicSigner(signer);
    setMagicContract(nftContract);
  }, [chainId])

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

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await logout();
    } catch(err) {
      handleError(err);
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
      handleError(err);
    }

    if(success) {
      console.log("LOGIN SUCCESS")
      setCheck(true);
    } else {
      console.log("LOGIN UNSUCCESSFUL")
      setLoginLoading(false)
      setCheck(true);
    }
  }

  function validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

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
      console.log("Transaction 2: ", tx2.hash);
    } catch(err) {
      handleError(err)
      return
    }
    
    let txNonce_magic = await magicSigner.getTransactionCount();
    console.log("MAGIC SIGNER: ", magicSigner)
    console.log("MAGIC SIGNER balance before: ", await magicSigner.getBalance())

    console.log("TRANSACTIONS: ", transactions);
    try {
      for(let i = 0; i < transactions.length; i++) {

        const { URI, amount } = transactions[i];
        console.log("TOKEN AMT: ", amount)
        for(let j = 1; j <= amount; j++) {
          console.log("Helllllo")                    

          if(i == transactions.length - 1 && j == amount) {
            const tx = magicContract.mint(user?.publicAddress as string, URI, {
              gasLimit: gasEstimates.uploadTransaction,
              nonce: txNonce_magic,
              gasPrice: ethers.utils.parseUnits(gasPrice, "gwei")
            })
            // console.log("MAGIC SIGNER balance after: ", await magicSigner.getBalance())
            fetch("/api/email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user?.email,
                txHash: tx.hash,
                contractAddress: contractAddress,
                chainId: chainId
              })
            })
          } else {
            const tx = magicContract.mint(user?.publicAddress as string, URI, {
              gasLimit: gasEstimates.uploadTransaction,
              nonce: txNonce_magic,
              gasPrice: ethers.utils.parseUnits(gasPrice, "gwei")
            })
            
            // console.log("complete")
            txNonce_magic++
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
          onClick={user?.isLoggedIn ? () => uploadTokensTransaction(library, account) : () => handleLogin(email)}
          isLoading={loginLoading || loading}
          loadingText={loadingText}
          colorScheme={success ? "green" : "gray"}
          isDisabled={success || (!user?.isLoggedIn && !validateEmail(email))}
        >
          {success
            ? `We'll email you when all's done.`
            : user?.isLoggedIn 
              ? "Upload all tokens to your NFT collection" 
              : "Submit email"}
        </Button>
      </Stack>
      
    </>
  )
}