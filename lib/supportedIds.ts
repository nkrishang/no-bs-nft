export const supportedIds: any = {
  ids: [1, 3, 137, 80001],
  1: {
    name:"Mainnet",
    explorer: "https://etherscan.io/tx/",
    contractExplorer: "https://etherscan.io/address/",
    url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
  },
  3: {
    name: "Ropsten",
    explorer: "https://ropsten.etherscan.io/tx/",
    contractExplorer: "https://ropsten.etherscan.io/address/",
    url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
  },
  137: {
    name: "Matic",
    explorer: "https://explorer-mainnet.maticvigil.com/tx/",
    contractExplorer: "https://explorer-mainnet.maticvigil.com/address/",
    url: "https://rpc.maticvigil.com/?jwt=eyJhbGciOiJIUzI1NiJ9.a3Jpc2hhbmcubm90ZUBnbWFpbC5jb20.VM9Ae_oaBmEPbhAKH9nxq-ZwhAVlIEx_XhLirvfvswc/"
  },
  80001: {
    name: "Mumbai",
    explorer: "https://explorer-mumbai.maticvigil.com/tx/",
    contractExplorer: "https://explorer-mumbai.maticvigil.com/address/",
    url: "https://rpc-mumbai.maticvigil.com"
  }
}
