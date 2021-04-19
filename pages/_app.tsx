import 'tailwindcss/tailwind.css'

import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react"

import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";

import React from "react";
import { MetaData } from "components/MetaData";
import Account from "components/Account";

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  return library;
}

function App({ Component, pageProps }: AppProps): JSX.Element {

  return (
    <>
      <MetaData />
      <Web3ReactProvider 
        getLibrary={getLibrary}
      >  
        <ChakraProvider>          
          
          {/* <Account /> */}
          <Component {...pageProps} /> 
        </ChakraProvider>           
      </Web3ReactProvider>
    </>
  );
}

export default App;