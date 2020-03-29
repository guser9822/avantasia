pragma solidity ^0.6.0;

import "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RDToken is ERC20 {
    string public constant name = 'Riccardo Dan Token';
    string public constant symbol = 'RDT';
    uint8 public constant decimals = 2;
    uint constant _initial_supply = 2100000000;

    constructor() public {
        _mint(msg.sender, _initial_supply);
    }
}