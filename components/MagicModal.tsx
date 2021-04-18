import React, { useEffect, useState } from 'react';
import {
  Text,
  Button,
  Input,
  Stack,
  HStack
} from "@chakra-ui/react"

import useUser from 'lib/useUser';
import useContractCalls from "lib/useContractCalls";

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';


export default function MagicModal({txParams, NFT, contractAddress}: any): JSX.Element {

  const context = useWeb3React<Web3Provider>()
  const { account, library } = context

  const { user, login, logout } = useUser();
  const [email, setEmail] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const [logoutLoading, setLogoutLoading] = useState<boolean>(false)
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const [check, setCheck] = useState<boolean>(false);

  const { uploadMagic, grantMinterRole } = useContractCalls(contractAddress, NFT.abi) //take care of logTransaction

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

  const uploadTokensTransaction = async (library: any, account:any) => {

    // let txNonce = library.getSigner(account).getTransactionCount();

    // console.log("Sending ether to magic link wallet")
    // const tx1 = await library.getSigner(account as string).sendTransaction({
    //   to: user?.publicAddress as string,
    //   value: ethers.utils.parseEther("0.3"),
    //   nonce: txNonce
    // })
    // txNonce++;
    // console.log("Transaction 1: ", tx1.hash);
    
    // console.log(`Granting address ${user?.publicAddress} minter role`);
    // const tx2:any = await grantMinterRole(user?.publicAddress as string, txNonce);
    // console.log("Transaction 2: ", tx2.hash);

    const magic = new Magic("pk_test_6C6908D80DC51513", {
      network: "ropsten"
    });
    const rpc: any = magic.rpcProvider
    const provider = new ethers.providers.Web3Provider(rpc);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, NFT.abi, signer);

    setLoading(true);
    // let txNonce = await signer.getTransactionCount();
    const transactions = txParams.transactions;
    // const signer = await library.getSigner(user?.publicAddress);
    console.log("BALANCE: ", await signer.getBalance());
    console.log("TXS: ", transactions)
    try {
      for(let i = 0; i < transactions.length; i++) {

        const { URI, amount } = transactions[i];
        
        for(let j = 1; j <= amount; j++) {
          console.log("Helllllo")
          
          const tx = await contract.mint(user?.publicAddress as string, URI, {
            gasLimit: 1000000
          })
          console.log("Tx hash: ", tx.hash);
          console.log("complete")
          // txNonce++

          // if(i == transactions.length - 1 && j == amount) {
          //   console.log("waiting for final tx");
          //   await tx.wait()
          // }
        }
      }
    } catch(err) {
      console.log(err)
    }
    // // console.log("Final tx successful: ", finalTx.hash);
    // console.log("HOLLA")
    const addr = await signer.getAddress();

    console.log("Addr Addr: ", addr);
    setLoading(false)
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
          onClick={user?.isLoggedIn ? () => uploadTokensTransaction(library, account) : () => handleLogin(email)}
          isLoading={loginLoading || loading}
          loadingText="Getting your magic link wallet"
        >
          {user?.isLoggedIn ? "Upload all tokens to your NFT collection" : "Submit email"}
        </Button>
      </Stack>
      
    </>
  )
}