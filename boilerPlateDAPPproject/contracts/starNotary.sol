pragma solidity ^0.4.23;

import '../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }  

//  Add a name and a symbol for your starNotary tokens
    string public name = "StarNotaryToken";
    string public symbol = "SNT";
//

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

// Add a function lookUptokenIdToStarInfo, that looks up the stars using the Token ID, and then returns the name of the star.
    function lookUpTokenIdToStarInfo(uint256 _tokenId) public view returns (string _name) {
        // confirm token ID is valid
        require(_tokenId > 0);

        Star memory readStar = tokenIdToStarInfo[_tokenId];

        return readStar.name;
    }
//

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
        starsForSale[_tokenId] = 0;
      }

// Add a function called exchangeStars, so 2 users can exchange their star tokens...
//Do not worry about the price, just write code to exchange stars between users.
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        // note:  there was nothing in the requirements whicn indicated stars to be exchanged should be for sale, particulary since we are ignoring price
        
        // confirm token IDs are valid
        require(_tokenId1 > 0);
        require(_tokenId2 > 0);

        // determine star owners 
        address star1Owner = ownerOf(_tokenId1);
        address star2Owner = ownerOf(_tokenId2);

        // remove tokens from ownership
        _removeTokenFrom(star1Owner, _tokenId1);
        _removeTokenFrom(star2Owner, _tokenId2);

        // add tokens to exchanged owners
        _addTokenTo(star1Owner, _tokenId2);
        _addTokenTo(star2Owner, _tokenId1);
      }
//

// Write a function to Transfer a Star. The function should transfer a star from the address of the caller.
// The function should accept 2 arguments, the address to transfer the star to, and the token ID of the star.
    function transferStar(address _newOwner, uint256 _tokenId) public payable {
        // validate parameters
        require(_newOwner > address(0));
        require(_tokenId > 0);
        require(starsForSale[_tokenId] > 0);

        // validate sufficient gas
        uint256 starCost = starsForSale[_tokenId];
        require(msg.value >= starCost);

        // remove token from ownership of sender; add it to new owner
        _removeTokenFrom(msg.sender, _tokenId);
        _addTokenTo(_newOwner, _tokenId);

        // transfer gas
        msg.sender.transfer(starCost);

        if(msg.value > starCost) {
            _newOwner.transfer(msg.value - starCost);
        }
        starsForSale[_tokenId] = 0;
      }
       
//

}
