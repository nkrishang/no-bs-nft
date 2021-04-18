// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// Base contract credit: OpenZeppelin
import "./ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "./BidExecutor.sol";

contract NFT is ERC721PresetMinterPauserAutoId {

    uint public totalTokensMinted;
    address public bidExecutor;

    struct Bid {
        address bidder;
        uint bidValue;
    }

    struct Threshold {
        uint value;
        bool active;
    }

    mapping(uint => Bid) public bids;
    mapping(uint => Threshold) public threshold;
    mapping(uint => string) public URI;

    event NewBid(uint indexed tokenID, address indexed bidder, uint bidValue);
    event BidAccepted(uint indexed tokenID, address indexed owner, address indexed bidder, uint bidValue);

    constructor(
        string memory name_, 
        string memory symbol_, 
        address _bidExecutor
    ) ERC721PresetMinterPauserAutoId(name_, symbol_, '') {
        bidExecutor = _bidExecutor;
    }

    /// @notice Grants minter role to `_addr`
    function grantMinterRole(address _addr) external {
        grantRole(MINTER_ROLE, _addr);
    }

    /// @notice Returns the URI associated with `tokenId`. See EIP 721 metadata spec.
    function tokenURI(uint _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        return URI[_tokenId];
    }

    /// @notice Let's address with MINTER_ROLE mint a token.
    function mint(address _to, string calldata _URI) public {

        if(!isApprovedForAll(msg.sender, bidExecutor)) {
            setApprovalForAll(bidExecutor, true);
        }

        uint tokenId = mint(_to);
        totalTokensMinted = tokenId;
        URI[tokenId] = _URI;
    }

    function setThreshold(uint _tokenId, uint _value, bool _active) external {
        require(_exists(_tokenId), "ERC721: token has not been minted.");
        require(msg.sender == ownerOf(_tokenId), "Only the token owner can accept the bid.");

        threshold[_tokenId].value = _value;
        threshold[_tokenId].active = _active;
    }

    /// @notice Lets an address make a bid of value `_bidValue` for toen with id `tokenId`.
    function makeBid(uint _tokenId, uint _bidValue) external payable {
        
        Bid memory bid = bids[_tokenId];

        require(_exists(_tokenId), "ERC721: token has not been minted.");
        require(_bidValue == msg.value, "Must lock up the bid amount in the contract.");
        require(_bidValue > bid.bidValue, "The new bid value must exceed the current bid value.");

        if(bid.bidder != address(0)) {
           (bool sent,) = bid.bidder.call{value: bid.bidValue}("");
           require(sent, "Ether not sent to the previous bidder");
        }

        if(threshold[_tokenId].active && msg.value >= threshold[_tokenId].value) {
            
            (bool sent,) = ownerOf(_tokenId).call{value: msg.value}("");
            require(sent, "Ether not sent to the owner of token");
            
            BidExecutor(bidExecutor).executeBid(_tokenId, msg.sender);   

            bid.bidder = address(0);
            bid.bidValue = 0;
            bids[_tokenId] = bid;

            emit BidAccepted(_tokenId, ownerOf(_tokenId), msg.sender, bid.bidValue);
        } else {
            bid.bidder = msg.sender;
            bid.bidValue = _bidValue;
            bids[_tokenId] = bid;

            emit NewBid(_tokenId, bid.bidder, bid.bidValue);
        }
    }

    /// @notice Lets the owner of token with id `tokenId` accept the current bid.
    function acceptBid(uint _tokenId) external payable {

        Bid memory bid = bids[_tokenId];

        require(_exists(_tokenId), "ERC721: token has not been minted.");
        require(msg.sender == ownerOf(_tokenId), "Only the token owner can accept the bid.");
        require(bid.bidder != address(0), "Please wait for someone to make the bid before accepting.");

        (bool sent,) = msg.sender.call{value: bid.bidValue}("");
        require(sent, "Ether not sent to the owner of token");

        safeTransferFrom(msg.sender, bid.bidder, _tokenId, "");

        emit BidAccepted(_tokenId, msg.sender, bid.bidder, bid.bidValue);

        bid.bidder = address(0);
        bid.bidValue = 0;
        bids[_tokenId] = bid;
    }

    // ========== Getter functions ==========

    function getCurrentBidValue(uint _tokenId) public view returns (uint) {
        require(_exists(_tokenId), "ERC721: token has not been minted.");
        return bids[_tokenId].bidValue;
    }

    function getCurrentBidder(uint _tokenId) public view returns (address) {
        require(_exists(_tokenId), "ERC721: token has not been minted.");
        return bids[_tokenId].bidder;
    }

    function getThresholdValue(uint _tokenId) public view returns (uint) {
        require(_exists(_tokenId), "ERC721: token has not been minted.");
        return threshold[_tokenId].value;
    }

    function getThresholdStatus(uint _tokenId) public view returns (bool) {
        require(_exists(_tokenId), "ERC721: token has not been minted.");
        return threshold[_tokenId].active;
    }
}