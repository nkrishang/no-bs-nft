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

import {parse, stringify} from 'flatted';

export default function MagicModal({magicLoading, handleMagicError, handleTransaction, magicLoadingText, magicSuccess}: any): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account, library } = context

  const { user, login, logout } = useUser();
  const [email, setEmail] = useState<string>('');

  const [loadingText, setLoadingText] = useState<string>('');
  const [logoutLoading, setLogoutLoading] = useState<boolean>(false)
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

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
          onClick={user?.isLoggedIn ? () => handleTransaction() : () => handleLogin(email)}
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