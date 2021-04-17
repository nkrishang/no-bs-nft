import React, { useEffect, useState } from 'react';
import {
  Text,
  Button,
  Input,
  Stack,
  HStack
} from "@chakra-ui/react"

import useUser from 'lib/useUser';

export default function MagicModal({txParams}: any): JSX.Element {

  // const { user, login, logout } = modalParams;

  const { user, login, logout } = useUser();
  const [email, setEmail] = useState<string>('');

  const [logoutLoading, setLogoutLoading] = useState<boolean>(false)
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const [check, setCheck] = useState<boolean>(false);

  useEffect(() => {
    console.log("USER EMAIL: ", user?.email);
    console.log("USER PUBLIC ADDR: ", user?.publicAddress)

    if(user?.isLoggedIn) {
      setEmail(user.email as string)
      setLoginLoading(false)
    }

    console.log("Checking")
  }, [user])

  const handleLogout = async () => {
    setLogoutLoading(true)
    logout();
    setLogoutLoading(false)
  }

  const handleLogin = async (email: string) => {
    setLoginLoading(true)
    login(email);
    setCheck(!check);
  }

  function validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  const uploadTokensTransaction = async () => {

  }
  return (
    <>
      <Text my="2">
        {`
          You need to confirm only one transaction. We will send you an email once all your tokens
          have been uploaded to your collection.
        `}
      </Text>

      <Text my="2">
        {`
          We ask you to deposit the total (estimated) transaction cost plus 10% for leeway, into your
          non-cutodial magic link wallet.
        `}
      </Text>
      <Text my="2">
        {`
          We keep the remainder as fees.
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
          onClick={user?.isLoggedIn ? uploadTokensTransaction : () => handleLogin(email)}
          isLoading={loginLoading}
          loadingText="Getting your magic link wallet"
        >
          {user?.isLoggedIn ? "Upload all tokens to your NFT collection" : "Submit email"}
        </Button>
      </Stack>
      
    </>
  )
}