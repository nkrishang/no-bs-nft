const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {

  const [deployer] = await hre.ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const BidExecutor_Factory = await hre.ethers.getContractFactory("BidExecutor");
  const bidExecutor = await BidExecutor_Factory.deploy();

  console.log("bidExecutor address:", bidExecutor.address);

  const NFT_Factory = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT_Factory.deploy("Matic test", "Matic", bidExecutor.address)

  console.log("nft address:", nft.address);

  console.log(process.argv);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });