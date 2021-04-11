const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Should deploy contract and upload URI at the right places", () => {

    let owner;
    let collector;
    let otherCollector;

    let contract;
    let bidExecutor;

    const name = "name";
    const symbol = "SYMBOL";
    const URI = "Dummy URI";

    const ownerThreshold = ethers.utils.parseEther('2');
    const collectorBid = ethers.utils.parseEther('1');
    const otherCollectorBid = ethers.utils.parseEther('1.5');

    beforeEach(async() => {

        [owner, collector, otherCollector] = await ethers.getSigners();

        const BE_contractFactory = await ethers.getContractFactory("BidExecutor");
        bidExecutor = await BE_contractFactory.deploy();

        const contractFactory = await ethers.getContractFactory("NFT");
        contract = await contractFactory.deploy(name, symbol, bidExecutor.address);

        bidExecutor.setNftFactory(contract.address);
    })

    it("Should print the contract address", () => {

        console.log(`Owner: ${owner.address} \n Collector: ${collector.address} \n Other Collector: ${otherCollector.address}`);
        console.log("Contract deployed at address: ", contract.address);
    })  

    it("Should let owner mint a token to themselves", async () => {

        await contract.connect(owner).mint(owner.address, URI);

        const URI_from_contract = await contract.tokenURI(1);

        expect(URI_from_contract).to.equal(URI);
    })

    it("Should let the owner set a threshold for the token", async () => {
        await contract.connect(owner).mint(owner.address, URI);
        
        const id = await contract.totalTokensMinted();
        await contract.connect(owner).setThreshold(id, ownerThreshold, true);

        const threshold = await contract.getThresholdValue(id);
        const status = await contract.getThresholdStatus(id);

        expect(threshold.toString()).to.equal(ownerThreshold);
        expect(status).to.equal(true);
    })

    it("Should allow the collector to place a bid", async () => {
        await contract.connect(owner).mint(owner.address, URI);
        const id = await contract.totalTokensMinted();
        await contract.connect(owner).setThreshold(id, ownerThreshold, true);

        await contract.connect(collector).makeBid(id, collectorBid, { value: collectorBid });

        const currentBidValue = await contract.getCurrentBidValue(id);
        const currentBidder = await contract.getCurrentBidder(id);

        expect(currentBidValue.toString()).to.equal(collectorBid);
        expect(currentBidder).to.equal(collector.address);
    })

    it("Should pay out the previous collector upon a higher bid", async () => {
        await contract.connect(owner).mint(owner.address, URI);
        const id = await contract.totalTokensMinted();
        await contract.connect(owner).setThreshold(id, ownerThreshold, true);
        await contract.connect(collector).makeBid(id, collectorBid, {value: collectorBid});

        const collectorBalBeforeNewBid = await collector.getBalance();

        await contract.connect(otherCollector).makeBid(id, otherCollectorBid, { value: otherCollectorBid });

        const currentBidValue = await contract.getCurrentBidValue(id);
        const currentBidder = await contract.getCurrentBidder(id);
        const collectorBalAfterNewBid = await collector.getBalance();

        expect(currentBidValue.toString()).to.equal(otherCollectorBid);
        expect(currentBidder).to.equal(otherCollector.address); 
        expect(
            parseFloat(ethers.utils.formatUnits(collectorBalAfterNewBid)) - parseFloat(ethers.utils.formatUnits(collectorBalBeforeNewBid)) 
        ).to.equal(1);
    })

    it("Should let owner of token accept the bid", async () => {
        await contract.connect(owner).mint(owner.address, URI);
        const id = await contract.totalTokensMinted();
        await contract.connect(owner).setThreshold(id, ownerThreshold, true);
        await contract.connect(collector).makeBid(id, collectorBid, {value: collectorBid});
        await contract.connect(otherCollector).makeBid(id, otherCollectorBid, { value: otherCollectorBid });

        const ownerBalBeforeSale = await owner.getBalance();
        await contract.connect(owner).acceptBid(id);
        const ownerBalAfterSale = await owner.getBalance();

        const newOwner = await contract.ownerOf(id);

        expect(newOwner).to.equal(otherCollector.address);
        expect(
            parseFloat(ethers.utils.formatUnits(ownerBalAfterSale)) - parseFloat(ethers.utils.formatUnits(ownerBalBeforeSale)) 
        ).to.be.gt(1.49); // Stupid javascript math
    })

    it("Should let collector buy the token forthe threshold value", async () => {
        await contract.connect(owner).mint(owner.address, URI);
        const id = await contract.totalTokensMinted();
        await contract.connect(owner).setThreshold(id, ownerThreshold, true);
        await contract.connect(collector).makeBid(id, collectorBid, {value: collectorBid});
        await contract.connect(otherCollector).makeBid(id, otherCollectorBid, { value: otherCollectorBid });

        const otherCollectorBalBeforeSale = await otherCollector.getBalance();
        const ownerBalBeforeSale = await owner.getBalance();

        await contract.connect(collector).makeBid(id, ownerThreshold, { value: ownerThreshold });

        const otherCollectorBalAfterSale = await otherCollector.getBalance();
        const ownerBalAfterSale = await owner.getBalance();
        const newOwner = await contract.ownerOf(id);

        expect(
            parseFloat(ethers.utils.formatUnits(otherCollectorBalAfterSale)) - parseFloat(ethers.utils.formatUnits(otherCollectorBalBeforeSale)) 
        ).to.be.gt(1.49); // Stupid javascript math

        expect(
            parseFloat(ethers.utils.formatUnits(ownerBalAfterSale)) - parseFloat(ethers.utils.formatUnits(ownerBalBeforeSale)) 
        ).to.be.gt(1.99); // Stupid javascript math

        expect(newOwner).to.equal(collector.address);
    })
})