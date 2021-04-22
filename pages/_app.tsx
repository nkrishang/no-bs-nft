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
import { ContractWrapper } from "lib/AppContext";

import NavbarWrapper from "components/NavbarWrapper";

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  return library;
}

export const getStaticProps: GetStaticProps = async (context) => {

  const {NFT, BidExecutor} = await compileERC721();

  return {
    props: {
      NFT,
      BidExecutor
    }
  }
}

function App({ NFT, BidExecutor, Component, pageProps }: any): JSX.Element {
  console.log(
    `NFT: ${NFT}`,
    `BE: ${BidExecutor}`
  )
  return (
    <>
      <MetaData />
      <Web3ReactProvider 
        getLibrary={getLibrary}
      >  
        <ChakraProvider>   
          <Web3EagerConnector />
          <ContractWrapper NFT={NFT} BidExecutor={BidExecutor}>
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