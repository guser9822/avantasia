pragma solidity ^0.6.2;

// Our first contract is a faucet!
contract Faucet {
    // Give out ether to anyone who asks
    function withdraw(uint withdraw_amount) public {
        // Limit withdrawal amount
        require(withdraw_amount <= 100000000000000000,'To much ether!');
        // Send the amount to the address that requested it
        msg.sender.transfer(withdraw_amount);
    }
    // Invoked when no function match. If non- payable transaction will revert
    fallback() external {}

    // Invoked when call data is empty
    receive() external payable{}

}