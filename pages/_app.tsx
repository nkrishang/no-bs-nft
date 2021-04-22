import 'tailwindcss/tailwind.css'

import { AppProps } from "next/app";
import { ChakraProvider, Center } from "@chakra-ui/react"

import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";

import { useWeb3React } from '@web3-react/core';

import React, { createContext, useContext, useState, useEffect } from "react";
import { MetaData } from "components/MetaData";
import { Web3EagerConnector } from "components/Web3EagerConnector";

import { GetStaticProps } from 'next'
import { compileERC721 } from 'lib/compile';
import { useDefaultSkyDB } from "lib/useSkyDB";

import { ContractContext, ContractWrapper } from "lib/AppContext";
import Navbar from 'components/Navbar';
import CollectionList  from 'components/CollectionList';

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  return library;
}

function NavbarWrapper({ children }: any): JSX.Element {

  const { contracts } = useContext(ContractContext);

  return (
    <>
      <Navbar />
      {children}
      <CollectionList NFTs={contracts}/>
    </>
  )
}

function App({ Component, pageProps }: AppProps): JSX.Element {

  return (
    <>
      <MetaData />
      <Web3ReactProvider 
        getLibrary={getLibrary}
      >  
        <ChakraProvider>   
          <Web3EagerConnector />
          <ContractWrapper>
            <NavbarWrapper>
              <Component {...pageProps} /> 
            </NavbarWrapper>
          </ContractWrapper>

        </ChakraProvider>           
      </Web3ReactProvider>
    </>
  );
}

export default App;