pragma solidity ^0.6.0;

import "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "../../../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";

contract RDToken is Ownable, ERC20, ERC20Detailed  {

    uint constant _initial_supply = 2100000000;

    constructor() ERC20Detailed("Riccardo Dan Token", "RDT", 2) public {
        _mint(msg.sender, _initial_supply);
    }

    // Contract destructor
    function destroy() public onlyOwner {
        selfdestruct(payable(owner()));
    }

}