// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./ERC20Token.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface TUProxy {
    function logic() external returns (address);
}

contract ERC20ContractFactory is Ownable {
    address public _proxyAddress;

    address[] private _tokenClones;

    event CloneERC20Created(address newERC20Address);

    function setERC20ProxyAddress(address proxyAddress_) public onlyOwner {
        _proxyAddress = proxyAddress_;
    }

    function createERC20Token(
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_
    ) public onlyOwner {
        address _tokenAddress = TUProxy(_proxyAddress).logic();
        address cloneERC20Address = createClone(_tokenAddress);
        ERC20Token(cloneERC20Address).init(name_, symbol_, totalSupply_);
        _tokenClones.push(cloneERC20Address);
        emit CloneERC20Created(cloneERC20Address);
    }

    function getCreatedCloneAddresses() public view returns (address[] memory) {
        return _tokenClones;
    }

    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(
                clone,
                0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
            )
            mstore(add(clone, 0x14), targetBytes)
            mstore(
                add(clone, 0x28),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )
            result := create(0, clone, 0x37)
        }
    }

    function isClone(address target, address query)
        internal
        view
        returns (bool result)
    {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(
                clone,
                0x363d3d373d3d3d363d7300000000000000000000000000000000000000000000
            )
            mstore(add(clone, 0xa), targetBytes)
            mstore(
                add(clone, 0x1e),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )

            let other := add(clone, 0x40)
            extcodecopy(query, other, 0, 0x2d)
            result := and(
                eq(mload(clone), mload(other)),
                eq(mload(add(clone, 0xd)), mload(add(other, 0xd)))
            )
        }
    }
}
