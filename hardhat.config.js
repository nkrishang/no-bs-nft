require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.0",
  networks: {
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${TEST_PRIVATE_KEY}`]
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${TEST_PRIVATE_KEY}`]
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/v1/084e575b9401d628d1507747de3e0f72ef07261c/",
      accounts: [`${TEST_PRIVATE_KEY}`]
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com/v1/084e575b9401d628d1507747de3e0f72ef07261c/",
      accounts: [`${TEST_PRIVATE_KEY}`]
    }
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};