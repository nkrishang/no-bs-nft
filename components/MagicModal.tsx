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