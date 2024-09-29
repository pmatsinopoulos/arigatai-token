// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

string constant NAME = "Arigatai";
string constant SYMBOL = "ARIG";

contract Arigatai is ERC20, ERC20Pausable, Ownable {
    constructor(
        address initialOwner
    ) ERC20(NAME, SYMBOL) Ownable(initialOwner) {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Make transfer ownership function work only when paused
    // -------------------------------------------------------
    function renounceOwnership() public override onlyOwner whenPaused {
        super.renounceOwnership();
    }

    function transferOwnership(
        address newOwner
    ) public override onlyOwner whenPaused {
        super.transferOwnership(newOwner);
    }

    // -------------------------------------------------------

    // INTERNALs
    // ---------

    // The following functions are overrides required by Solidity.

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }

    // ---- end of INTERNALs ------------------------------------
}
