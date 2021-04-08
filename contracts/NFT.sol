// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract NFT is ERC721PresetMinterPauserAutoId {

    constructor(string memory name_, string memory symbol_) ERC721PresetMinterPauserAutoId(name_, symbol_, '') {}

    struct Bid {
        address bidder;
        uint bidValue;
    }

    mapping(uint => Bid) public bids;
    mapping(uint => string) public URI;

    event NewBid(uint indexed tokenID, address indexed bidder, uint bidValue);
    event BidAccepted(uint indexed tokenID, address indexed owner, address indexed bidder, uint bidValue);

    /// @notice Returns the URI associated with `tokenId`. See EIP 721 metadata spec.
    function tokenURI(uint _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        return URI[_tokenId];
    }

    /// @notice Let's address with MINTER_ROLE mint a token.
    function mint(address _to, string calldata _URI) public {
        uint tokenId = mint(_to);
        URI[tokenId] = _URI;
    }

    /// @notice Lets an address make a bid of value `_bidValue` for toen with id `tokenId`.
    function makeBid(uint _tokenId, uint _bidValue) external payable {
        
        Bid memory bid = bids[_tokenId];

        require(_exists(_tokenId), "ERC721: token has not been minted.");
        require(_bidValue == msg.value, "Must lock up the bid amount in the contract.");
        require(_bidValue > bid.bidValue, "The new bid value must exceed the current bid value.");

        if(bid.bidder != address(0)) {
           bid.bidder.call{value: bid.bidValue};
        }

        bid.bidder = msg.sender;
        bid.bidValue = _bidValue;
        bids[_tokenId] = bid;

        emit NewBid(_tokenId, bid.bidder, bid.bidValue);
    }

    /// @notice Lets the owner of token with id `tokenId` accept the current bid.
    function acceptBid(uint _tokenId) external payable {

        Bid memory bid = bids[_tokenId];

        require(_exists(_tokenId), "ERC721: token has not been minted.");
        require(msg.sender == ownerOf(_tokenId), "Only the token owner can accept the bid.");
        require(bid.bidder != address(0), "Please wait for someone to make the bid before accepting.");

        msg.sender.call{value: bid.bidValue};
        safeTransferFrom(msg.sender, bid.bidder, _tokenId, "");

        emit BidAccepted(_tokenId, msg.sender, bid.bidder, bid.bidValue);

        bid.bidder = address(0);
        bid.bidValue = 0;
        bids[_tokenId] = bid;
    }

    // ========== Getter functions ==========

    function getCurrentBidValue(uint _tokenId) public view returns (uint) {
        return bids[_tokenId].bidValue;
    }

    function getCurrentBidder(uint _tokenId) public view returns (address) {
        return bids[_tokenId].bidder;
    }

}