const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Should deploy contract and upload URI at the right places", () => {

    let owner;
    let contract;

    const name = "name";
    const symbol = "SYMBOL";
    const URI = "Dummy URI";

    beforeEach(async() => {

        [owner] = await ethers.getSigners();

        const contractFactory = await ethers.getContractFactory("NFT");
        contract = await contractFactory.deploy(name, symbol);

        console.log("Contract deploed at address: ", contract.address);
    })

    it("Should let owner mint a token to themselves", async () => {

        await contract.connect(owner).mint(owner.address, URI);

        const URI_from_contract = await contract.tokenURI(1);

        expect(URI_from_contract).to.equal(URI);
    })
})